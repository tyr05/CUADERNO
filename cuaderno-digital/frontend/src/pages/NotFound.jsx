import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="mx-auto max-w-md rounded bg-white p-6 text-center shadow">
      <h2 className="text-3xl font-bold">404</h2>
      <p className="mt-2 text-sm text-slate-600">La página que buscás no existe.</p>
      <Link to="/" className="mt-4 inline-block rounded bg-sky-600 px-4 py-2 text-white">
        Volver al inicio
      </Link>
    </div>
  );
};

export default NotFound;
