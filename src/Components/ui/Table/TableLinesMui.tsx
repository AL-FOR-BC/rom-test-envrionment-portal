import React from "react";
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  styled,
  TablePagination,
  TextField,
  Collapse,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { Link } from "react-router-dom";
import { Row, Col } from "reactstrap";
import { useAppDispatch, useAppSelector } from "../../../store/hook";
import {
  closeModalRequisition,
  editRequisitionLine,
  openModalRequisition,
} from "../../../store/slices/Requisitions";
import { PlusIcon, SearchIcon } from "../../common/icons/icons";
import ModelMui from "../ModelMui/ModelMui";

const StyledTableCell = styled(TableCell)(() => ({
  [`&.MuiTableCell-head`]: {
    backgroundColor: "#ffffff",
    color: "#2c3e50",
    fontWeight: 600,
    padding: "16px 20px",
    borderSpacing: "8px",
    fontFamily: "inherit",
    fontSize: "0.875rem",
    borderBottom: "1px solid #e0e0e0",
  },
  [`&.MuiTableCell-body`]: {
    padding: "16px 20px",
    fontFamily: "inherit",
    fontSize: "0.875rem",
    color: "#495057",
    borderBottom: "1px solid #f0f0f0",
  },
}));

const StyledTableRow = styled(TableRow)(() => ({
  "&:last-child td, &:last-child th": {
    border: 0,
  },
  "&:hover": {
    backgroundColor: "#f0f4ff",
    transition: "background-color 0.2s ease",
  },
}));

interface TableLinesMuiProps {
  data: any[];
  columns: any[];
  status: string;
  modelFields: any[];
  handleSubmitLines: () => void;
  clearLineFields: () => void;
  handleSubmitUpdatedLine: () => void;
  handleValidateHeaderFields: () => boolean;
  documentName?: string;
  multipleLines?: boolean;
}

// Clean Cell component for displaying text with ellipsis
const CleanCell = ({
  value,
  onRowClick,
  isClickable = false,
}: {
  value: any;
  onRowClick?: () => void;
  isClickable?: boolean;
}) => {
  if (!value)
    return (
      <span style={{ color: "#999", fontStyle: "italic" }}>Not specified</span>
    );

  const maxLength = 100;
  const strValue =
    typeof value === "string" ? value : value != null ? String(value) : "";
  const isLong = strValue.length > maxLength;
  const displayValue = strValue.slice(0, maxLength) + (isLong ? "..." : "");

  return (
    <div
      style={{
        display: "block",
        whiteSpace: "pre-line",
        wordBreak: "break-word",
        lineHeight: "1.4",
        maxHeight: "80px",
        overflow: "hidden",
        cursor: isClickable ? "pointer" : "default",
      }}
      onClick={() => {
        if (isClickable && onRowClick) {
          onRowClick();
        }
      }}
      title={isClickable ? "Click to view details" : ""}
    >
      {displayValue}
    </div>
  );
};

// Collapsible Row Component for Performance Appraisal
const CollapsibleRow = ({
  row,
  columns,
  isExpanded,
  onToggle,
}: {
  row: any;
  columns: any[];
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const isPerformanceAppraisal =
    row.documentType === "Performance Appraisal" ||
    row.documentType === "Individual Performance Appraisal";

  return (
    <>
      <StyledTableRow
        sx={{
          cursor: "pointer",
          "&:hover": {
            backgroundColor: "#f0f4ff !important",
            transition: "background-color 0.2s ease",
          },
        }}
      >
        {columns.map((column, colIndex) => (
          <StyledTableCell key={colIndex}>
            {colIndex === 0 && (
              <span
                onClick={onToggle}
                style={{
                  marginRight: "8px",
                  color: "#1976d2",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  userSelect: "none",
                }}
                title="Click to expand/collapse"
              >
                {isExpanded ? "▼" : "▶"}
              </span>
            )}
            {[
              "jobObjective",
              "keyPerformanceIndicators",
              "deliverables",
              "byWhichTargetDate",
            ].includes(column.dataField) ? (
              <CleanCell
                value={row[column.dataField]}
                onRowClick={onToggle}
                isClickable={true}
              />
            ) : column.formatter ? (
              column.formatter(row[column.dataField], row)
            ) : (
              <CleanCell
                value={row[column.dataField]}
                onRowClick={onToggle}
                isClickable={true}
              />
            )}
          </StyledTableCell>
        ))}
      </StyledTableRow>
      {isPerformanceAppraisal && (
        <TableRow>
          <TableCell
            style={{ paddingBottom: 0, paddingTop: 0 }}
            colSpan={columns.length}
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
                          Strategic Objective
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
                          <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
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
                          Individual Objective
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
                          <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                            {row.keyPerformanceIndicators || "Not specified"}
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
                          Initiative
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
                          <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
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
                          Measures
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
                          <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
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
                          Target Date
                        </Typography>
                        <Box
                          sx={{
                            backgroundColor: "#f8f9fa",
                            padding: 2,
                            borderRadius: 1.5,
                            minHeight: "60px",
                            border: "1px solid #e9ecef",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                            {row.byWhichTargetDate || "Not specified"}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

const TableLinesMui: React.FC<TableLinesMuiProps> = ({
  data,
  columns,
  status,
  modelFields,
  handleSubmitLines,
  clearLineFields,
  handleSubmitUpdatedLine,
  handleValidateHeaderFields,
  documentName,
}) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [expandedRows, setExpandedRows] = React.useState<Set<number>>(
    new Set()
  );

  const { isEdit, isModalRequisition, isModalRequisitionLoading } =
    useAppSelector((state) => state.purchaseRequisition.purchaseRequisition);
  const dispatch = useAppDispatch();

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    console.log("", event);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const toggleModel = () => {
    console.log("handleValidateHeaderFields", handleValidateHeaderFields());
    if (handleValidateHeaderFields()) {
      console.log("isModalOpen", isModalRequisition);
      if (isModalRequisition) {
        console.log("isModalOpen", isModalRequisition);
        clearLineFields();
        dispatch(editRequisitionLine(false));
        dispatch(closeModalRequisition());
      } else {
        clearLineFields();
        dispatch(openModalRequisition());
      }
    }
  };

  const handleRowToggle = (rowIndex: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(rowIndex)) {
      newExpandedRows.delete(rowIndex);
    } else {
      newExpandedRows.add(rowIndex);
    }
    setExpandedRows(newExpandedRows);
  };

  // Filter data based on search term
  const filteredData = data.filter((row) =>
    Object.values(row).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Calculate paginated data
  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Simplified pagination component
  const CustomTablePagination = () => (
    <div className="d-flex justify-content-end align-items-center mt-3">
      <TablePagination
        component="div"
        count={filteredData.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        sx={{
          ".MuiTablePagination-toolbar": {
            padding: 0,
          },
          ".MuiTablePagination-selectLabel": {
            marginBottom: 0,
          },
          ".MuiTablePagination-displayedRows": {
            marginBottom: 0,
          },
          ".MuiTablePagination-select": {
            paddingTop: 0,
            paddingBottom: 0,
          },
        }}
      />
    </div>
  );

  return (
    <>
      <ModelMui
        isOpen={isModalRequisition}
        toggleModal={toggleModel}
        isEdit={isEdit}
        title={documentName ? `${documentName} Line` : "Requisition Line"}
        isModalLoading={isModalRequisitionLoading}
        fields={modelFields}
        handleSubmit={handleSubmitLines}
        handleUpdateLine={handleSubmitUpdatedLine}
      />

      <Row className="mb-2">
        <Col sm="4">
          <div className="search-box me-2 mb-2 d-inline-block">
            <div className="position-relative">
              <TextField
                size="small"
                placeholder="Search..."
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <SearchIcon
                      style={{
                        marginRight: "8px",
                        color: "#6c757d",
                        width: "16px",
                        height: "16px",
                      }}
                    />
                  ),
                  sx: {
                    height: "36px",
                    fontSize: "0.875rem",
                    fontFamily: "inherit",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#ced4da",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#ced4da",
                    },
                  },
                }}
              />
            </div>
          </div>
        </Col>

        <Col sm="8">
          {status === "Open" && (
            <div className="text-sm-end">
              <Link
                className="btn btn-primary btn-label"
                to="#"
                onClick={toggleModel}
              >
                <PlusIcon className="label-icon" />
                {documentName
                  ? `Add ${documentName} Line`
                  : "Add Requisition Line"}
              </Link>
            </div>
          )}
        </Col>
      </Row>

      <TableContainer
        sx={{
          overflow: "hidden",
        }}
      >
        <Table
          sx={{
            minWidth: 650,
            borderCollapse: "separate",
            borderSpacing: "0",
            fontFamily: "inherit",
          }}
          size="medium"
        >
          <TableHead>
            <TableRow>
              {columns.map((column, index) => (
                <StyledTableCell key={index}>
                  {index === 0 &&
                    documentName &&
                    (documentName.includes("Performance") ||
                      documentName.includes("IPA")) && (
                      <span
                        style={{
                          marginRight: "8px",
                          fontSize: "0.75rem",
                          color: "#6c757d",
                        }}
                      >
                        ⚡
                      </span>
                    )}
                  {column.text}
                </StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, rowIndex) => {
              const isPerformanceAppraisal =
                row.documentType === "Performance Appraisal" ||
                row.documentType === "Individual Performance Appraisal";

              if (isPerformanceAppraisal) {
                return (
                  <CollapsibleRow
                    key={rowIndex}
                    row={row}
                    columns={columns}
                    isExpanded={expandedRows.has(rowIndex)}
                    onToggle={() => handleRowToggle(rowIndex)}
                  />
                );
              } else {
                return (
                  <StyledTableRow key={rowIndex}>
                    {columns.map((column, colIndex) => (
                      <StyledTableCell key={colIndex}>
                        {[
                          "jobObjective",
                          "keyPerformanceIndicators",
                          "deliverables",
                          "byWhichTargetDate",
                        ].includes(column.dataField) ? (
                          <CleanCell value={row[column.dataField]} />
                        ) : column.formatter ? (
                          column.formatter(row[column.dataField], row)
                        ) : (
                          <CleanCell value={row[column.dataField]} />
                        )}
                      </StyledTableCell>
                    ))}
                  </StyledTableRow>
                );
              }
            })}
          </TableBody>
        </Table>
        <CustomTablePagination />
      </TableContainer>
    </>
  );
};

export default TableLinesMui;
