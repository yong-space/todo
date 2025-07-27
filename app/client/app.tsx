"use client"

import { Dispatch, SetStateAction, useEffect, useRef, useState, useActionState } from 'react';
import { Todo } from '../interfaces';
import { addTask, getTasks } from '../server/actions';
import TodoItems from './todo-items';
import { polyfill } from 'mobile-drag-drop';
import { DarkIcon, LightIcon, LogoutIcon } from './icons';

interface AppProps {
  token: string;
  darkMode: boolean | null;
  setDarkMode: Dispatch<SetStateAction<boolean | null>>;
}

export default ({ token, darkMode, setDarkMode } : AppProps) => {
  const [ tasks, setTasks ] = useState([] as Todo[]);
  const [ loading, setLoading ] = useState(true);
  const [ disableSubmit, setDisableSubmit ] = useState(true);
  const effectRan = useRef(false);

  const handleLogout = () => {
    localStorage.removeItem('session');
    window.location.reload();
  };

  polyfill();

  useEffect(() => {
    if (effectRan.current) {
      return;
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
    getTasks(token)
      .then((data) => setTasks(data))
      .finally(() => setLoading(false));

    return () => {
      effectRan.current = true;
    };
  }, []);

  const saveItem = async (_: unknown, formData: FormData) => {
    const newItemName = formData.get('taskName') as string;
    if (newItemName?.length < 3) {
      return;
    }
    const maxOrder = tasks.reduce((max, obj) => Math.max(max, obj.order), -Infinity);
    setTasks(await addTask(token, maxOrder + 1, newItemName));
  };

  const [ _, handleSubmit, isPending ] = useActionState(saveItem, undefined);

  return (
    <div className="flex flex-1 flex-col justify-between shadow-lg rounded-md p-2 m-2 gap-3 bg-teal-50 dark:bg-gray-800">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-xl text-teal-700 dark:text-teal-300">
          Todo
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="cursor-pointer"
          >
            <LogoutIcon />
          </button>
          <div
            className="cursor-pointer"
            onClick={() => setDarkMode((before) => !before)}
          >
            { darkMode ? <LightIcon /> : <DarkIcon /> }
          </div>
        </div>
      </div>
      <div className="flex flex-1 gap-1 flex-col overflow-y-scroll">
        {(!loading && tasks.length === 0) && (
          <div>
            No tasks yet
          </div>
        )}
        <TodoItems
          tasks={tasks}
          setTasks={setTasks}
          token={token}
        />
      </div>
      <form action={handleSubmit} className="flex gap-2">
        <input
          className="appearance-none w-0 bg-teal-50 text-teal-700 border-teal-700 placeholder:italic placeholder:text-teal-500 placeholder:font-light focus:ring-teal-700 focus:border-teal-700 focus:shadow-none flex-1 rounded p-3 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:cursor-not-allowed"
          name="taskName"
          type="text"
          placeholder="New task.."
          autoComplete="off"
          disabled={isPending}
          onChange={({ target }) => setDisableSubmit(target.value.length < 3)}
        />
        <button
          className="shadow bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-nowrap disabled:bg-slate-500 disabled:text-slate-100 disabled:border-slate-200 disabled:cursor-not-allowed"
          type="submit"
          disabled={disableSubmit || isPending}
        >
          Add Todo
        </button>
      </form>
    </div>
  );
};
