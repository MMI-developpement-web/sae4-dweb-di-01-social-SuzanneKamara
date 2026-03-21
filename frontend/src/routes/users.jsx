import { useLoaderData } from 'react-router-dom';
import { fetchUsers } from '../lib/loaders.js';

export async function loader() {
  return fetchUsers();
}

export default function Users() {
  const data = useLoaderData();

  return (
    <section className='p-6'>
      <h1 className='text-2xl font-semibold'>Users</h1>
      <pre className='mt-4 overflow-x-auto rounded bg-slate-100 p-4 text-sm'>
        {JSON.stringify(data, null, 2)}
      </pre>
    </section>
  );
}
