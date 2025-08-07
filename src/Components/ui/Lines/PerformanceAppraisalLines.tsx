import React from "react";
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
} from "@mui/material";
import {
  StyledTableCell,
  StyledTableRow,
  CleanCell,
} from "../Table/StyledTable";
import EditIcon from "@mui/icons-material/Edit";
import ModelMui from "../ModelMui/ModelMui";

interface PerformanceAppraisalLine {
  systemId: string;
  jobObjective: string;
  keyPerformanceIndicators: string;
  deliverables: string;
  byWhichTargetDate: string;
  [key: string]: any;
}

interface QuestionQ2Line {
  systemId: string;
  question: string;
  element: string;
  whatDoYouThinkCausesTheDifficulty: string;
  [key: string]: any;
}

interface QuestionQ1Line {
  systemId: string;
  question: string;
  description: string;
  [key: string]: any;
}

interface PerformanceAppraisalLinesProps {
  lines:
    | PerformanceAppraisalLine[]
    | QuestionQ2Line[]
    | QuestionQ1Line[]
    | any[];
  columns: {
    dataField: string;
    text: string;
    sort?: boolean;
    formatter?: (cellContent: any, row: any) => React.ReactElement;
  }[];
  status: string;
  mode?: "pa" | "questionQ2" | "questionQ1";
  expandedRows?: Set<number>;
  onToggleExpansion?: (rowIndex: number) => void;
}

const PerformanceAppraisalLines: React.FC<PerformanceAppraisalLinesProps> = ({
  lines,
  columns,
  mode = "pa",
  expandedRows: externalExpandedRows,
  onToggleExpansion,
}) => {
  const [internalExpandedRows, setInternalExpandedRows] = React.useState<
    Set<number>
  >(new Set());

  // Use external expanded rows if provided, otherwise use internal state
  const expandedRows = externalExpandedRows || internalExpandedRows;

  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalFields, setModalFields] = React.useState<any[]>([]);
  const handleRowToggle = (rowIndex: number) => {
    if (onToggleExpansion) {
      // Use external toggle function
      onToggleExpansion(rowIndex);
    } else {
      // Use internal state
      const newExpandedRows = new Set(expandedRows);
      if (newExpandedRows.has(rowIndex)) {
        newExpandedRows.delete(rowIndex);
      } else {
        newExpandedRows.add(rowIndex);
      }
      setInternalExpandedRows(newExpandedRows);
    }
  };

  const handleEditClick = (row: any) => {
    // Prepare fields for ModelMui
    const fields = allColumns
      .filter((col) => col.dataField !== "action")
      .map((col) => ({
        label: col.text,
        type: "text",
        value: row[col.dataField] || "",
        onChange: (e: any) => handleEditChange(col.dataField, e.target.value),
        id: col.dataField,
        disabled: false,
      }));

    setModalFields([fields]);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleEditChange = (fieldName: string, value: string) => {
    // Update modalFields with the new value
    setModalFields((prev) =>
      prev.map((row) =>
        row.map((field: any) =>
          field.id === fieldName ? { ...field, value } : field
        )
      )
    );
  };

  const handleEditSave = () => {
    // For now, just close the modal. You can wire up API save logic here.
    setModalOpen(false);
  };

  // No pagination needed since TablePagination was removed
  const displayData = lines;

  const actionColumn = {
    dataField: "action",
    text: "Action",
    formatter: (_: any, row: any) => (
      <IconButton size="small" onClick={() => handleEditClick(row)}>
        <EditIcon fontSize="small" sx={{ color: "#1976d2" }} />
      </IconButton>
    ),
  };
  const allColumns = React.useMemo(() => {
    // Only add action column if not already present
    if (columns.some((col) => col.dataField === "action")) return columns;
    return [...columns, actionColumn];
  }, [columns]);

  return (
    <TableContainer
      component={Paper}
      sx={{ boxShadow: "none", border: "none" }}
    >
      {/* Search input removed */}
      <Table size="small">
        <TableHead>
          <TableRow>
            {allColumns.map((column, index) => (
              <StyledTableCell key={index}>{column.text}</StyledTableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {displayData.map((row, rowIndex) => {
            if (mode === "questionQ2" || mode === "questionQ1") {
              return (
                <StyledTableRow key={row.systemId || rowIndex}>
                  {allColumns.map((column, colIndex) => (
                    <StyledTableCell key={colIndex}>
                      {column.dataField === "action" ? (
                        column.formatter?.(null, row)
                      ) : (
                        <CleanCell value={row[column.dataField]} />
                      )}
                    </StyledTableCell>
                  ))}
                </StyledTableRow>
              );
            }
            // Default: PA lines with collapsible
            const isExpanded = expandedRows.has(rowIndex);
            return (
              <React.Fragment key={row.systemId || rowIndex}>
                <StyledTableRow
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "#f0f4ff !important",
                      transition: "background-color 0.2s ease",
                    },
                  }}
                  onClick={() => handleRowToggle(rowIndex)}
                >
                  {allColumns.map((column, colIndex) => (
                    <StyledTableCell key={colIndex}>
                      {column.dataField === "action" ? (
                        column.formatter?.(null, row)
                      ) : (
                        <>
                          {colIndex === 0 && (
                            <span
                              style={{
                                marginRight: "8px",
                                color: "#1976d2",
                                fontSize: "0.75rem",
                              }}
                            >
                              {isExpanded ? "▼" : "▶"}
                            </span>
                          )}
                          <CleanCell
                            value={row[column.dataField]}
                            isClickable={true}
                          />
                        </>
                      )}
                    </StyledTableCell>
                  ))}
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell
                    style={{ paddingBottom: 0, paddingTop: 0 }}
                    colSpan={allColumns.length}
                  >
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                      <Box sx={{ margin: 1 }}>
                        <Card
                          variant="outlined"
                          sx={{
                            backgroundColor: "#ffffff",
                            border: "1px solid #e3f2fd",
                            borderRadius: 2,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          }}
                        >
                          <CardContent sx={{ padding: 3 }}>
                            <Typography
                              variant="h6"
                              gutterBottom
                              sx={{
                                fontSize: "1.1rem",
                                fontWeight: 600,
                                color: "#1976d2",
                                marginBottom: 3,
                                borderBottom: "2px solid #e3f2fd",
                                paddingBottom: 1,
                              }}
                            >
                              Performance Details
                            </Typography>
                            <Grid container spacing={3}>
                              <Grid item xs={12} sm={6} md={4}>
                                <Typography
                                  variant="subtitle2"
                                  color="textSecondary"
                                  gutterBottom
                                  sx={{ fontWeight: 600, color: "#555" }}
                                >
                                  Job Objective
                                </Typography>
                                <Box
                                  sx={{
                                    backgroundColor: "#f8f9fa",
                                    padding: 2,
                                    borderRadius: 1.5,
                                    minHeight: "60px",
                                    border: "1px solid #e9ecef",
                                    display: "flex",
                                    alignItems: "flex-start",
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{ lineHeight: 1.5 }}
                                  >
                                    {row.jobObjective || "Not specified"}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={12} sm={6} md={4}>
                                <Typography
                                  variant="subtitle2"
                                  color="textSecondary"
                                  gutterBottom
                                  sx={{ fontWeight: 600, color: "#555" }}
                                >
                                  Key Performance Indicator(s)
                                </Typography>
                                <Box
                                  sx={{
                                    backgroundColor: "#f8f9fa",
                                    padding: 2,
                                    borderRadius: 1.5,
                                    minHeight: "60px",
                                    border: "1px solid #e9ecef",
                                    display: "flex",
                                    alignItems: "flex-start",
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{ lineHeight: 1.5 }}
                                  >
                                    {row.keyPerformanceIndicators ||
                                      "Not specified"}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={12} sm={6} md={4}>
                                <Typography
                                  variant="subtitle2"
                                  color="textSecondary"
                                  gutterBottom
                                  sx={{ fontWeight: 600, color: "#555" }}
                                >
                                  Measures/Deliverables
                                </Typography>
                                <Box
                                  sx={{
                                    backgroundColor: "#f8f9fa",
                                    padding: 2,
                                    borderRadius: 1.5,
                                    minHeight: "60px",
                                    border: "1px solid #e9ecef",
                                    display: "flex",
                                    alignItems: "flex-start",
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{ lineHeight: 1.5 }}
                                  >
                                    {row.deliverables || "Not specified"}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={12} sm={6} md={4}>
                                <Typography
                                  variant="subtitle2"
                                  color="textSecondary"
                                  gutterBottom
                                  sx={{ fontWeight: 600, color: "#555" }}
                                >
                                  By which Target Date?
                                </Typography>
                                <Box
                                  sx={{
                                    backgroundColor: "#f8f9fa",
                                    padding: 2,
                                    borderRadius: 1.5,
                                    minHeight: "60px",
                                    border: "1px solid #e9ecef",
                                    display: "flex",
                                    alignItems: "flex-start",
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{ lineHeight: 1.5 }}
                                  >
                                    {row.byWhichTargetDate || "Not specified"}
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Box>
                    </Collapse>
                  </StyledTableCell>
                </StyledTableRow>
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
      {/* TablePagination removed for all modes */}
      <ModelMui
        title="Line"
        isOpen={modalOpen}
        toggleModal={handleModalClose}
        size="lg"
        isModalLoading={false}
        fields={modalFields}
        isEdit={true}
        handleUpdateLine={handleEditSave}
      />
    </TableContainer>
  );
};

export default PerformanceAppraisalLines;
