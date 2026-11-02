import { Link } from 'react-router-dom'
import { EmptyState } from '../components/ui.jsx'

export default function NotFound() {
  return (
    <div className="px-4 py-16">
      <EmptyState title="Page not found" action={<Link to="/" className="btn btn-primary">Go to the home page</Link>}>
        The page you opened does not exist or has moved.
      </EmptyState>
    </div>
  )
}
