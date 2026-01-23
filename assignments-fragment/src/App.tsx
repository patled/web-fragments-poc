import { FragmentRouter } from './FragmentRouter'
import AssignmentsRoutes from './AssignmentsRoutes'

function App() {
  return (
    <div>
      <FragmentRouter fragmentId="project-assignments" basePath="/assignments">
        <AssignmentsRoutes />
      </FragmentRouter>
    </div>
  )
}

export default App
