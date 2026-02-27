import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

import {
  Container,
  Typography,
  Button,
  TextField,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Chip,
  Stack,
  Box,
  Alert,
  IconButton,
  Tooltip,
  Skeleton,
  alpha,
  useTheme,
} from "@mui/material";

import LogoutIcon from "@mui/icons-material/Logout";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeviceHubIcon from "@mui/icons-material/DeviceHub";
import SearchOffIcon from "@mui/icons-material/SearchOff";

function UserDashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDevices = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError("");
    try {
      const res = await API.get("/api/device/my-devices");
      setDevices(res.data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError("Failed to load devices. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();

    const interval = setInterval(() => {
      fetchDevices(false);
    }, 10000); // every 10 sec

    return () => clearInterval(interval);
  }, []);

  // Filter devices whenever search or devices change
  useEffect(() => {
    const filtered = devices.filter((device) =>
      device.device_id.toLowerCase().includes(search.toLowerCase()),
    );
    setFilteredDevices(filtered);
  }, [search, devices]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const handleRefresh = () => {
    fetchDevices();
  };

  const handleRetry = () => {
    fetchDevices();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "success";
      case "offline":
        return "error";
      case "warning":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* ===== HEADER SINGLE ROW ===== */}
<Stack
  direction={{ xs: "column", md: "row" }}
  alignItems={{ xs: "flex-start", md: "center" }}
  justifyContent="space-between"
  spacing={2}
  mb={3}
>

  {/* TOP / LEFT SECTION */}
  <Stack
    direction="row"
    alignItems="center"
    spacing={2}
    flexWrap="wrap"
    sx={{ width: "100%" }}
  >
    <Stack direction="row" alignItems="center" spacing={1}>
      <DeviceHubIcon color="primary" fontSize="large" />
      <Typography variant="h4" fontWeight="600">
        Air Ok Devices
      </Typography>

      {!loading && devices.length > 0 && (
        <Chip
          label={`${filteredDevices.length} of ${devices.length}`}
          size="small"
          color="primary"
          variant="outlined"
        />
      )}
    </Stack>

    {/* SEARCH BAR */}
    <TextField
      label="Search"
      variant="outlined"
      size="small"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      sx={{
        minWidth: 200,
        flexGrow: 1,
        maxWidth: 300
      }}
      disabled={loading}
    />
  </Stack>

  {/* RIGHT SECTION */}
  <Stack direction="row" alignItems="center" spacing={1}>
    {lastUpdated && (
      <Typography variant="caption" color="text.secondary">
        Last updated: {lastUpdated}
      </Typography>
    )}

    <Tooltip title="Refresh">
      <IconButton onClick={handleRefresh} disabled={loading}>
        <RefreshIcon />
      </IconButton>
    </Tooltip>

    <Button
      variant="outlined"
      color="error"
      startIcon={<LogoutIcon />}
      onClick={handleLogout}
    >
      Logout
    </Button>
  </Stack>

</Stack>

      {/* Error alert */}
      {error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleRetry}>
              Retry
            </Button>
          }
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      {/* Table or Loading skeleton */}
      <Paper
        elevation={3}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                }}
              >
                <TableCell>
                  <Typography fontWeight="600">Device ID</Typography>
                </TableCell>
                <TableCell>
                  <Typography fontWeight="600">Location</Typography>
                </TableCell>
                <TableCell>
                  <Typography fontWeight="600">Status</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography fontWeight="600">Action</Typography>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                // Skeleton rows
                Array.from(new Array(5)).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton variant="text" width={120} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={150} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="rounded" width={70} height={24} />
                    </TableCell>
                    <TableCell align="center">
                      <Skeleton variant="rounded" width={80} height={36} />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredDevices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                    <Stack alignItems="center" spacing={1}>
                      <SearchOffIcon
                        sx={{ fontSize: 48, color: "text.disabled" }}
                      />
                      <Typography variant="h6" color="text.secondary">
                        {search
                          ? "No devices match your search"
                          : "No devices found"}
                      </Typography>
                      {search && (
                        <Button variant="text" onClick={() => setSearch("")}>
                          Clear search
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDevices.map((device) => (
                  <TableRow
                    key={device.device_id}
                    hover
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      transition: "background-color 0.2s",
                    }}
                  >
                    <TableCell>
                      <Typography fontWeight="500">
                        {device.device_id}
                      </Typography>
                    </TableCell>
                    <TableCell>{device.location || "—"}</TableCell>
                    <TableCell>
                      <Chip
                        label={device.status}
                        color={getStatusColor(device.status)}
                        size="small"
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/device/${device.device_id}`)}
                        sx={{ textTransform: "none" }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Optional: Add pagination if needed */}
      {/* <Stack direction="row" justifyContent="flex-end" mt={2}>
        <Pagination count={10} color="primary" />
      </Stack> */}
    </Container>
  );
}

export default UserDashboard;
