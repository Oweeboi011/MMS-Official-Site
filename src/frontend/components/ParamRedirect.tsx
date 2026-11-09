import { Navigate, useParams } from 'react-router-dom';

// Old Open Climbs links (emails, notifications) keep working: `:param` tokens in `to` take the URL's values.
export default function ParamRedirect({ to }: { to: string }) {
  const params = useParams();
  const target = to.replace(/:(\w+)/g, (_, name: string) => encodeURIComponent(params[name] ?? ''));
  return <Navigate to={target} replace />;
}
