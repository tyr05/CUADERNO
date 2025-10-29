import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const PrivateRoute = ({ children, roles }) => {
  const { token, user } = useAuth();
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(user.rol)) {
    return (
      <div className="rounded border border-amber-500 bg-amber-100 p-4 text-amber-800">
        <h2 className="text-lg font-bold">Acceso restringido</h2>
        <p>No tenés permisos para ver esta sección.</p>
      </div>
    );
  }

  return children;
};

export default PrivateRoute;
