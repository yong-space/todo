"use server";

import { AnyBulkWriteOperation, ObjectId } from 'mongodb';
import { Todo, TodoOrder } from '../interfaces';
import client from './mongodb';
import { verifySession } from './session';

const collection = client.db('todo').collection<Todo>('todo');

const authorise = async (token: string): Promise<string> => {
  if (!token) {
    throw new Error('No session token provided');
  }
  const sessionData = await verifySession(token);
  if (!sessionData?.email) {
    throw new Error('Invalid session');
  }
  if (sessionData?.expiresAt < Date.now()) {
    throw new Error('Session expired');
  }
  return sessionData.email;
};

export const getTasks = async (token: string): Promise<Todo[]> => {
  const email = await authorise(token);
  try {
    const data = await collection
      .find({ owner: email })
      .sort({ done: 1, order: -1, created: 1 })
      .toArray();
    return JSON.parse(JSON.stringify(data));
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const addTask = async (token: string, order: number, newTaskName: string) => {
  const email = await authorise(token);
  const newTodo: Todo = {
    _id: new ObjectId(),
    name: newTaskName,
    done: false,
    created: new Date(),
    owner: email,
    order,
  };
  console.log('Creating new todo:', newTodo);
  await collection.insertOne(newTodo);
  return await getTasks(token);
};

export const toggleTask = async (token: string, id: string, done: boolean) => {
  console.log(`Marking todo ${id} as ${done}`);
  const email = await authorise(token);
  const data = await collection.updateOne({ _id: new ObjectId(id), owner: email }, { $set: { done } });
  return JSON.parse(JSON.stringify(data));
};

export const renameTask = async (token: string, id: string, name: string) => {
  console.log(`Renaming ${id} to ${name}`);
  const email = await authorise(token);
  const data = await collection.updateOne({ _id: new ObjectId(id), owner: email }, { $set: { name } });
  return JSON.parse(JSON.stringify(data));
};

export const deleteTask = async (token: string, id: string) => {
  const email = await authorise(token);
  await collection.deleteOne({ _id: new ObjectId(id), owner: email });
};

export const updateOrder = async (token: string, data: TodoOrder[]) => {
  const email = await authorise(token);

  const bulkOps: AnyBulkWriteOperation<Todo>[] = data.map((item) => ({
    updateOne: {
      filter: { _id: new ObjectId(item.id), owner: email },
      update: { $set: { order: item.order } }
    }
  }));
  await collection.bulkWrite(bulkOps);
};
