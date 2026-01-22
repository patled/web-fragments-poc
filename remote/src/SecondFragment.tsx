import { useState, useEffect, useRef } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

export default function SecondFragment() {
  const [counter, setCounter] = useState(0)
  const [message, setMessage] = useState('')
  const [fragmentData, setFragmentData] = useState('')
  const [receivedData, setReceivedData] = useState<string | null>(null)
  const channelRef = useRef<BroadcastChannel | null>(null)

  useEffect(() => {
    // BroadcastChannel für Kommunikation mit Shell erstellen
    const channel = new BroadcastChannel('shell-fragment-communication')
    channelRef.current = channel

    // Nachrichten von der Shell empfangen
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'shell-to-fragment' && event.data.fragmentId === 'second-example') {
        setReceivedData(event.data.payload)
      }
    }

    channel.addEventListener('message', handleMessage)

    return () => {
      channel.removeEventListener('message', handleMessage)
      channel.close()
      channelRef.current = null
    }
  }, [])

  const sendDataToShell = () => {
    if (channelRef.current && fragmentData.trim()) {
      channelRef.current.postMessage({
        type: 'fragment-to-shell',
        fragmentId: 'second-example',
        payload: fragmentData,
        timestamp: new Date().toISOString(),
      })
      setFragmentData('')
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="overline" color="text.secondary">
            Web Fragments Remote - Second Fragment
          </Typography>
          <Typography variant="h4" component="h1" gutterBottom>
            Second Fragment Example
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This is a second fragment component served from the same remote app.
          </Typography>
        </Box>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Message: {message || 'No message yet'}</Typography>
              <TextField
                label="Enter a message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                size="small"
                fullWidth
              />
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label={`Counter: ${counter}`} color="primary" variant="outlined" />
                <Chip label="Second Fragment" color="secondary" variant="outlined" />
              </Stack>
            </Stack>
          </CardContent>
          <CardActions>
            <Button variant="contained" onClick={() => setCounter((value) => value + 1)}>
              Increment
            </Button>
            <Button variant="text" onClick={() => setCounter(0)}>
              Reset Counter
            </Button>
          </CardActions>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Fragment → Shell Communication</Typography>
              <TextField
                label="Daten an Shell senden"
                value={fragmentData}
                onChange={(event) => setFragmentData(event.target.value)}
                size="small"
                fullWidth
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    sendDataToShell()
                  }
                }}
              />
              <Button variant="contained" onClick={sendDataToShell} disabled={!fragmentData.trim()}>
                An Shell senden
              </Button>
              {receivedData && (
                <Alert severity="success">
                  <Typography variant="body2">
                    <strong>Empfangen von Shell:</strong> {receivedData}
                  </Typography>
                </Alert>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Alert severity="info">
          The host route /second/ mounts this fragment; assets are proxied via /second/*.
        </Alert>
      </Stack>
    </Container>
  )
}
