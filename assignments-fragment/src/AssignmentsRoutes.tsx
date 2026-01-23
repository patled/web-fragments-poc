import { Route, Routes } from 'react-router-dom'
import Box from '@mui/material/Box'
import AssignmentsFragment from './AssignmentsFragment'

export default function AssignmentsRoutes() {
  return (
    <Box>
      <Routes>
        <Route index element={<AssignmentsFragment />} />
        <Route path=":projectId" element={<AssignmentsFragment />} />
      </Routes>
    </Box>
  )
}
