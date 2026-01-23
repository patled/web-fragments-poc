import { Link, Route, Routes } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import SecondFragment from './SecondFragment'

function SecondAbout() {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Stack spacing={2}>
        <Typography variant="h4" component="h2">
          Second Fragment – About
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This is a sub-route inside the second fragment. The shell URL should reflect it (e.g.
          /second/about).
        </Typography>
        <Alert severity="info">Back/forward should sync via the shell URL.</Alert>
      </Stack>
    </Container>
  )
}

export default function SecondFragmentRoutes() {
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
        <Link to="about">About</Link>
      </Box>

      <Routes>
        <Route index element={<SecondFragment />} />
        <Route path="about" element={<SecondAbout />} />
      </Routes>
    </Box>
  )
}

