import React from "react";
import { RiseLoader } from "react-spinners";
import LoadingOverlayWrapper from "react-loading-overlay-ts";
import {
  //   Box,
  Container,
  Alert as MuiAlert,
  Card,
  CardContent,
} from "@mui/material";
import Select from "react-select";
import { GridColDef, GridRowId } from "@mui/x-data-grid";
import BreadCrumbs from "../../BreadCrumbs";
// import ApprovalEntries from "../../common/ApprovalEntry";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import {
  ArrowBackIcon,
  CancelIcon,
  ConvertIcon,
  DeleteIcon,
  ReopenIcon,
  SaveIcon,
  SendIcon,
} from "../../common/icons/icons";
import classNames from "classnames";
import { Button, Row, Col, Collapse, Input, Label } from "reactstrap";
import Attachments from "../../common/Attachment";
import ApprovalEntries from "../../common/ApprovalEntry";
import ApprovalAction from "../../common/ApprovalAction";
import ApprovalComments from "../../common/ApprovalComments";
import Swal from "sweetalert2";

interface HeaderMuiProps {
  title: string;
  subtitle: string;
  breadcrumbItem: string;
  fields: any[];
  isLoading: boolean;
  showError?: boolean;
  docError?: string;
  toggleError?: () => void;
  handleBack?: () => void;
  handleSubmit?: () => void;
  handleSendApprovalRequest?: () => void;
  handleDeletePurchaseRequisition?: () => void;
  handleCancelApprovalRequest?: () => void;
  lines?: React.ReactNode;
  status?: string;
  buttons?: {
    label: string;
    color: string;
    icon: string;
    onClick: () => void;
  }[];
  pageType?: "detail" | "add" | "approval" | "time-sheet";
  companyId?: string;
  documentType?: string;
  stage?: string;
  requestNo?: string;
  editableLines?: boolean;
  onBlur?: () => void;
  columns?: GridColDef[];
  rowLines?: any;
  handleSubmitLines?: (data: any, id: string) => void;
  handleDeleteLine?: (id: GridRowId) => void;
  handleEditLine?: (id: GridRowId) => void;
  tableId?: number;
  createNewLine?: (lineNo: number) => void;
  handleReopen?: () => void;
  handleDelete?: () => void;
  handleSendToAppraiser?: () => void;
  currentUser?: "Appraisee" | "Appraiser";
  handleConvertToPerformanceAppraisal?: () => void;
  handleSendToHeadOfDepartment?: () => void;
  handleSendBackToAppraisee?: () => void;
}

const HeaderMui: React.FC<HeaderMuiProps> = (props) => {
  const [generalTab, setGeneralTab] = React.useState(true);
  const toggleGeneral = () => setGeneralTab(!generalTab);

  const {
    title,
    subtitle,
    breadcrumbItem,
    fields,
    isLoading,
    showError,
    docError,
    toggleError,
    handleBack,
    handleSubmit,
    pageType,
    handleDelete,
    handleSendApprovalRequest,
    handleDeletePurchaseRequisition,
    handleCancelApprovalRequest,
    lines,
    status,
    companyId,
    documentType,
    stage,
    requestNo,
    editableLines,
    tableId,
    handleReopen,
    handleSendToAppraiser,
    currentUser,
    handleConvertToPerformanceAppraisal,
    handleSendToHeadOfDepartment,
    handleSendBackToAppraisee,
  } = props;
  console.log("currentUser", props.currentUser);
  console.log("stage", props.stage);
  return (
    <LoadingOverlayWrapper
      active={isLoading}
      spinner={<RiseLoader />}
      text="Please wait..."
    >
      <div className="page-content">
        <Container maxWidth={false}>
          <BreadCrumbs
            title={title}
            subTitle={subtitle}
            breadcrumbItem={breadcrumbItem}
          />

          {pageType === "add" && (
            <Row className="justify-content-center mb-4">
              <div className="d-flex flex-wrap gap-2">
                <Button
                  color="secondary"
                  className="btn btn-label"
                  onClick={handleBack}
                >
                  <i className="label-icon">
                    <ArrowBackIcon className="label-icon" />
                  </i>
                  Back
                </Button>
                <Button
                  color="primary"
                  className="btn btn-label"
                  onClick={handleSubmit}
                >
                  <i className="label-icon">
                    <SaveIcon className="label-icon" />
                  </i>
                  Create Request
                </Button>
              </div>
            </Row>
          )}

          {pageType === "detail" && (
            <>
              {status === "Open" && (
                <Row className="justify-content-center mb-4">
                  <div className="d-flex flex-wrap gap-2">
                    <Button
                      color="secondary"
                      className="btn btn-label"
                      onClick={handleBack}
                    >
                      <i className="label-icon">
                        <ArrowBackIcon className="label-icon" />
                      </i>
                      Back
                    </Button>
                    {documentType === "Performance Management" &&
                      stage === "Appraisee Rating" &&
                      currentUser === "Appraisee" &&
                      breadcrumbItem !== "Individual Performance Agreement" && (
                        <Button
                          color="primary"
                          className="btn btn-label"
                          onClick={handleSendToAppraiser}
                        >
                          <SendIcon className="label-icon" />
                          Send to Appraiser
                        </Button>
                      )}

                    {documentType === "Performance Management" &&
                      stage === "Appraiser Rating" &&
                      currentUser === "Appraiser" && (
                        <>
                          <Button
                            color="warning"
                            className="btn btn-label"
                            onClick={handleSendBackToAppraisee}
                          >
                            <ArrowBackIcon className="label-icon" />
                            Send back to Appraisee
                          </Button>
                          <Button
                            color="primary"
                            className="btn btn-label"
                            onClick={handleSendToHeadOfDepartment}
                          >
                            <SendIcon className="label-icon" />
                            Send To Head of Department
                          </Button>
                        </>
                      )}
                    {documentType === "Performance Management" &&
                      title === "IPA Details" &&
                      stage === "Appraisee Rating" &&
                      currentUser === "Appraisee" && (
                        <Button
                          color="primary"
                          className="btn btn-label"
                          onClick={handleSendApprovalRequest}
                        >
                          <SendIcon className="label-icon" />
                          Send Approval Request
                        </Button>
                      )}
                    {documentType !== "Performance Management" && (
                      <Button
                        color="primary"
                        className="btn btn-label"
                        onClick={handleSendApprovalRequest}
                      >
                        <SendIcon className="label-icon" />
                        Send Approval Request
                      </Button>
                    )}
                    <Attachments
                      defaultCompany={companyId}
                      docType={documentType}
                      docNo={requestNo}
                      status={status}
                      tableId={tableId}
                    />
                    <ApprovalEntries
                      defaultCompany={companyId}
                      docType={documentType}
                      docNo={requestNo}
                    />
                    <ApprovalComments
                      defaultCompany={companyId || ""}
                      docType={documentType || ""}
                      docNo={requestNo || ""}
                    />
                    {documentType === "Performance Management" &&
                      stage === "Appraisee Rating" &&
                      currentUser === "Appraisee" && (
                        <Button
                          color="danger"
                          className="btn btn-label"
                          onClick={
                            handleDeletePurchaseRequisition
                              ? handleDeletePurchaseRequisition
                              : () => {
                                  if (handleDelete) {
                                    Swal.fire({
                                      title: "Are you sure?",
                                      text: "You won't be able to revert this!",
                                      icon: "warning",
                                      showCancelButton: true,
                                      confirmButtonColor: "#3085d6",
                                      cancelButtonColor: "#d33",
                                      confirmButtonText: "Yes, delete it!",
                                    }).then((result) => {
                                      if (result.isConfirmed) {
                                        handleDelete();
                                      }
                                    });
                                  }
                                }
                          }
                        >
                          <DeleteIcon
                            className="label-icon"
                            style={{ padding: "8px" }}
                          />
                          Delete Request
                        </Button>
                      )}
                    {documentType !== "Performance Management" && (
                      <Button
                        color="danger"
                        className="btn btn-label"
                        onClick={
                          handleDeletePurchaseRequisition
                            ? handleDeletePurchaseRequisition
                            : () => {
                                if (handleDelete) {
                                  Swal.fire({
                                    title: "Are you sure?",
                                    text: "You won't be able to revert this!",
                                    icon: "warning",
                                    showCancelButton: true,
                                    confirmButtonColor: "#3085d6",
                                    cancelButtonColor: "#d33",
                                    confirmButtonText: "Yes, delete it!",
                                  }).then((result) => {
                                    if (result.isConfirmed) {
                                      handleDelete();
                                    }
                                  });
                                }
                              }
                        }
                      >
                        <DeleteIcon
                          className="label-icon"
                          style={{ padding: "8px" }}
                        />
                        Delete Request
                      </Button>
                    )}
                  </div>
                </Row>
              )}
              {status === "Pending Approval" && (
                <Row className="justify-content-center mb-4">
                  <div className="d-flex flex-wrap gap-2">
                    <Button
                      color="secondary"
                      className="btn  btn-label"
                      onClick={handleBack}
                    >
                      <i className="label-icon">
                        <ArrowBackIcon className="label-icon" />
                      </i>
                      Back
                    </Button>
                    <Button
                      color="danger"
                      type="button"
                      className="btn btn-danger btn-label"
                      onClick={handleCancelApprovalRequest}
                    >
                      Cancel Approval Request
                      <CancelIcon className="label-icon" />
                    </Button>
                    <Attachments
                      defaultCompany={companyId}
                      docType={documentType}
                      docNo={requestNo}
                      status={status}
                      tableId={tableId}
                    />

                    <ApprovalEntries
                      defaultCompany={companyId}
                      docType={documentType}
                      docNo={requestNo}
                    />
                  </div>
                </Row>
              )}
              {status === "Approved" && (
                <Row className="justify-content-center mb-4">
                  <div className="d-flex flex-wrap gap-2">
                    <Button
                      color="secondary"
                      className="btn  btn-label"
                      onClick={handleBack}
                    >
                      <i className="label-icon">
                        <ArrowBackIcon className="label-icon" />
                      </i>
                      Back
                    </Button>
                    {documentType === "Performance Management" &&
                      stage === "Appraisee Rating" &&
                      breadcrumbItem === "Individual Performance Agreement" && (
                        <>
                          <Button
                            color="primary"
                            className="btn btn-label"
                            onClick={handleConvertToPerformanceAppraisal}
                          >
                            <i className="label-icon">
                              <ConvertIcon className="label-icon" />
                            </i>
                            Convert to Performance Appraisal
                          </Button>
                        </>
                      )}
                    <Attachments
                      defaultCompany={companyId}
                      docType={documentType}
                      docNo={requestNo}
                      status={status}
                      tableId={tableId}
                    />

                    <ApprovalEntries
                      defaultCompany={companyId}
                      docType={documentType}
                      docNo={requestNo}
                    />
                    <ApprovalComments
                      defaultCompany={companyId || ""}
                      docType={documentType || ""}
                      docNo={requestNo || ""}
                    />
                  </div>
                </Row>
              )}
              {(documentType === "TIME SHEET" ||
                documentType === "Time Sheet") && (
                <>
                  {/*  reopen buttion */}
                  <Row className="justify-content-center mb-4">
                    <div className="d-flex flex-wrap gap-2">
                      <Button
                        color="secondary"
                        className="btn  btn-label"
                        onClick={handleReopen}
                      >
                        <i className="label-icon">
                          <ReopenIcon className="label-icon" />
                        </i>
                        Reopen
                      </Button>
                    </div>
                    {/*  submit button  */}
                    <div className="d-flex flex-wrap gap-2">
                      <Button
                        color="primary"
                        className="btn btn-label"
                        onClick={handleSubmit}
                      >
                        <i className="label-icon">
                          <SaveIcon className="label-icon" />
                        </i>
                        Submit
                      </Button>
                    </div>
                  </Row>
                </>
              )}
            </>
          )}
          {pageType === "approval" && (
            <>
              <Row className="justify-content-center mb-4">
                <div className="d-flex flex-wrap gap-2">
                  <Button
                    color="secondary"
                    className="btn  btn-label"
                    onClick={handleBack}
                  >
                    <i className="label-icon">
                      <ArrowBackIcon className="label-icon" />
                    </i>
                    Back
                  </Button>
                  <ApprovalAction
                    docNo={requestNo}
                    docType={documentType}
                    companyId={companyId}
                  />
                  {documentType != "Time Sheets" && (
                    <>
                      <Attachments
                        defaultCompany={companyId}
                        docType={documentType}
                        docNo={requestNo}
                        status={status}
                        tableId={tableId}
                      />

                      <ApprovalEntries
                        defaultCompany={companyId}
                        docType={documentType}
                        docNo={requestNo}
                      />
                    </>
                  )}
                </div>
              </Row>
            </>
          )}
          {pageType === "time-sheet" && (
            <>
              {/*  reopen buttion */}
              <Row className="justify-content-center mb-4">
                <div className="d-flex flex-wrap gap-2">
                  <Button
                    color="secondary"
                    className="btn btn-label"
                    onClick={handleBack}
                  >
                    <i className="label-icon">
                      <ArrowBackIcon className="label-icon" />
                    </i>
                    Back
                  </Button>
                  <Button
                    color="primary"
                    className="btn  btn-label"
                    onClick={handleReopen}
                  >
                    <i className="label-icon">
                      <ReopenIcon
                        className="label-icon"
                        style={{ padding: "6px" }}
                      />
                    </i>
                    Reopen
                  </Button>

                  {/*  submit button  */}

                  <Button
                    color="success"
                    className="btn btn-label"
                    onClick={handleSubmit}
                  >
                    <i className="label-icon">
                      <SaveIcon className="label-icon" />
                    </i>
                    Submit
                  </Button>
                </div>
              </Row>
            </>
          )}

          {showError && (
            <Row>
              <MuiAlert severity="error" onClose={toggleError} className="mb-2">
                <i className="mdi mdi-block-helper me-2"></i>
                {docError}
              </MuiAlert>
            </Row>
          )}

          <Row>
            <Card>
              <CardContent>
                <div
                  className="accordion accordion-flush"
                  id="accordionFlushContainer"
                >
                  <div className="accordion-item">
                    <h2 className="accordion-header" id="headingGeneral">
                      <button
                        className={classNames("accordion-button", "fw-medium", {
                          collapsed: !generalTab,
                        })}
                        type="button"
                        onClick={toggleGeneral}
                        style={{ cursor: "pointer" }}
                      >
                        General
                      </button>
                    </h2>
                    <Collapse
                      isOpen={generalTab}
                      className="accordion-collapse"
                      style={{ paddingBottom: 40 }}
                    >
                      <div className="accordion-body">
                        <Row>
                          {fields.map((field, index) => (
                            <Row className="mb-2" key={index}>
                              {field.map(
                                (
                                  {
                                    label,
                                    type,
                                    value,
                                    disabled,
                                    onChange,
                                    options,
                                    id,
                                    rows,
                                    onBlur,
                                    placeholder,
                                  },
                                  idx
                                ) => (
                                  <Col sm={3} key={idx}>
                                    <Label htmlFor={id}>{label}</Label>
                                    {type === "select" ? (
                                      <Select
                                        options={options}
                                        isDisabled={disabled}
                                        value={value}
                                        onChange={onChange}
                                        id={id}
                                        classNamePrefix="select"
                                        isSearchable={true}
                                        onBlur={onBlur}
                                        styles={{
                                          control: (baseStyles, state) => ({
                                            ...baseStyles,
                                            backgroundColor: "white",
                                            borderColor: state.isFocused
                                              ? "#556ee6"
                                              : "#ced4da",
                                            "&:hover": {
                                              borderColor: "#556ee6",
                                            },
                                            boxShadow: state.isFocused
                                              ? "0 0 0 0.2rem rgba(85, 110, 230, 0.25)"
                                              : "none",
                                            minHeight: "36px",
                                          }),
                                          menu: (baseStyles) => ({
                                            ...baseStyles,
                                            backgroundColor: "white",
                                            zIndex: 9999,
                                          }),
                                          menuList: (baseStyles) => ({
                                            ...baseStyles,
                                            maxHeight: "200px",
                                            "::-webkit-scrollbar": {
                                              width: "8px",
                                              height: "0px",
                                            },
                                            "::-webkit-scrollbar-track": {
                                              background: "#f1f1f1",
                                            },
                                            "::-webkit-scrollbar-thumb": {
                                              background: "#888",
                                              borderRadius: "4px",
                                            },
                                            "::-webkit-scrollbar-thumb:hover": {
                                              background: "#555",
                                            },
                                          }),
                                          option: (baseStyles, state) => ({
                                            ...baseStyles,
                                            backgroundColor: state.isSelected
                                              ? "#556ee6"
                                              : state.isFocused
                                              ? "#f8f9fa"
                                              : "white",
                                            color: state.isSelected
                                              ? "white"
                                              : "#495057",
                                            cursor: "pointer",
                                            "&:active": {
                                              backgroundColor: "#556ee6",
                                            },
                                          }),
                                          placeholder: (baseStyles) => ({
                                            ...baseStyles,
                                            color: "#74788d",
                                          }),
                                          singleValue: (baseStyles) => ({
                                            ...baseStyles,
                                            color: "#495057",
                                          }),
                                        }}
                                        theme={(theme) => ({
                                          ...theme,
                                          colors: {
                                            ...theme.colors,
                                            primary: "#556ee6",
                                            primary25: "#f8f9fa",
                                            primary50: "#f8f9fa",
                                            neutral20: "#ced4da",
                                          },
                                        })}
                                      />
                                    ) : type === "date" ? (
                                      <Flatpickr
                                        className="form-control"
                                        value={value}
                                        disabled={disabled}
                                        onChange={onChange}
                                        options={{
                                          dateFormat: "Y-m-d",
                                        }}
                                        id={id}
                                        onBlur={onBlur}
                                      />
                                    ) : (
                                      <Input
                                        type={type}
                                        value={value}
                                        disabled={disabled}
                                        onChange={onChange}
                                        placeholder={placeholder}
                                        rows={rows}
                                        id={id}
                                        onBlur={onBlur}
                                      />
                                    )}
                                  </Col>
                                )
                              )}
                            </Row>
                          ))}
                        </Row>
                      </div>
                    </Collapse>
                    {editableLines
                      ? // <LinesEditable
                        //     columns={columns ? columns : []}
                        //     handleSubmitLines={(data: any[]) => handleSubmitLines?.(data, '') || Promise.resolve({ success: false })}
                        //     documentType={documentType ? documentType : ''}
                        //     rowLines={rowLines}
                        //     handleDeleteLine={handleDeleteLine ? handleDeleteLine : () => { }}
                        //     handleEditLine={(data: any) => handleEditLine?.(data) || Promise.resolve({ success: false })}
                        //     createNewLine={createNewLine ? createNewLine : () => { }}
                        // />
                        ""
                      : lines}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Row>
        </Container>
      </div>
    </LoadingOverlayWrapper>
  );
};

export default HeaderMui;
