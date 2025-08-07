import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

interface SectionHeaderProps {
  title: string;
  open: boolean;
  onToggle: () => void;
  action?: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  open,
  onToggle,
  action,
}) => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="space-between"
    px={3}
    py={0.5}
    sx={{
      background: "#e9f0fb",
      borderRadius: 0,
      boxShadow: "none",
      borderBottom: "1px solid #d3e2f7",
      minHeight: 56,
      width: "100%",
    }}
  >
    <Typography
      sx={{
        color: "#144fa1",
        fontWeight: 600,
        fontSize: 16,
        fontFamily: "inherit",
        letterSpacing: 0.2,
        textAlign: "left",
        lineHeight: 1.2,
      }}
    >
      {title}
    </Typography>
    <Box display="flex" alignItems="center" gap={1}>
      {action}
      <IconButton onClick={onToggle} size="large">
        {open ? (
          <ExpandLessIcon sx={{ color: "#144fa1" }} />
        ) : (
          <ExpandMoreIcon sx={{ color: "#144fa1" }} />
        )}
      </IconButton>
    </Box>
  </Box>
);

export default SectionHeader;
