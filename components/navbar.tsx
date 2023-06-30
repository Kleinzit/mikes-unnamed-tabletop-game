import { useContext } from 'react';
import { GlobalContext } from '@/contexts/globalContext';

export const Navbar = () => {
  const { user } = useContext(GlobalContext);

  return (
    <nav className="flex items-center justify-between flex-wrap bg-teal-500 p-6">
      <div className="flex items-center flex-shrink-0 text-white mr-6">
        <span className="font-semibold text-xl tracking-tight">My App</span>
      </div>
      <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
        <div className="text-sm lg:flex-grow">
          <a href="/boilerplate" className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
            Boilerplate
          </a>
        </div>
        <div>
          <p className="text-white">Logged in as: {user}</p>
        </div>
      </div>
    </nav>
  )
}