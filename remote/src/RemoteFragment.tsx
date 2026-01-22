import { useMemo, useState, useEffect, useRef } from 'react'
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

export default function RemoteFragment() {
  const [count, setCount] = useState(0)
  const [name, setName] = useState('')
  const [fragmentData, setFragmentData] = useState('')
  const [receivedData, setReceivedData] = useState<string | null>(null)
  const channelRef = useRef<BroadcastChannel | null>(null)

  const greeting = useMemo(
    () => (name.trim() ? `Hello, ${name.trim()}` : 'Hello from the remote fragment'),
    [name],
  )

  useEffect(() => {
    // Create BroadcastChannel for communication with Shell
    const channel = new BroadcastChannel('shell-fragment-communication')
    channelRef.current = channel

    // Receive messages from Shell
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'shell-to-fragment' && event.data.fragmentId === 'remote-example') {
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
        fragmentId: 'remote-example',
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
            Web Fragments Remote
          </Typography>
          <Typography variant="h4" component="h1" gutterBottom>
            Remote Fragment Example
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This UI is rendered by the remote app and composed inside the shell.
          </Typography>
        </Box>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">{greeting}</Typography>
              <TextField
                label="Your name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                size="small"
                fullWidth
              />
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label={`Count: ${count}`} color="primary" variant="outlined" />
                <Chip label="MUI powered" color="secondary" variant="outlined" />
              </Stack>
            </Stack>
          </CardContent>
          <CardActions>
            <Button variant="contained" onClick={() => setCount((value) => value + 1)}>
              Increase
            </Button>
            <Button variant="text" onClick={() => setCount(0)}>
              Reset
            </Button>
          </CardActions>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Fragment → Shell Communication</Typography>
              <TextField
                label="Send data to Shell"
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
                Send to Shell
              </Button>
              {receivedData && (
                <Alert severity="success">
                  <Typography variant="body2">
                    <strong>Received from Shell:</strong> {receivedData}
                  </Typography>
                </Alert>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Alert severity="info">
          The host route /remote mounts this fragment; assets are proxied via /remote/*.
        </Alert>
      </Stack>
    </Container>
  )
}
