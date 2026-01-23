import { Link, Route, Routes } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import RemoteFragment from './RemoteFragment'

function RemoteDetails() {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Stack spacing={2}>
        <Typography variant="h4" component="h2">
          Remote Details
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This is a sub-route inside the remote fragment. The shell URL should now reflect this
          route (e.g. /remote/details).
        </Typography>
        <Alert severity="info">Use the nav above to switch routes without full reload.</Alert>
      </Stack>
    </Container>
  )
}

export default function RemoteFragmentRoutes() {
  return (
    <Box>
      <Box
        sx={{
          px: 2,
          py: 1.5,
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          display: 'flex',
          gap: 2,
        }}
      >
        <Link to="/">Home</Link>
        <Link to="details">Details</Link>
      </Box>

      <Routes>
        <Route index element={<RemoteFragment />} />
        <Route path="details" element={<RemoteDetails />} />
      </Routes>
    </Box>
  )
}

