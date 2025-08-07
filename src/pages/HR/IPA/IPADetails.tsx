import HeaderMui from "../../../Components/ui/Header/HeaderMui";
import { useIPA } from "./hooks/useIPA";
import { useNavigate, useParams } from "react-router-dom";
import Lines from "../../../Components/ui/Lines/Lines";
import { useEffect } from "react";
import { ActionFormatterLines } from "../../../Components/ui/Table/TableUtils";
import { useAppSelector } from "../../../store/hook";
import { apiIPALInes } from "../../../services/IpaSerivces";
import { IPALineFormData } from "../../../@types/ipa.dto";

function IPADetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { companyId } = useAppSelector((state) => state.auth.session);
  const { employeeNo } = useAppSelector((state) => state.auth.user);

  const {
    formData,
    getFormFields,
    getLineFields,
    populateDocumentDetail,
    lines,
    submitIPALines,
    clearLineFields,
    handleEditLine,
    deleteIPA,
    updateIPALines,
    sendIPAForApproval,
    cancelIPAApprovalRequest,
    convertToPerformanceAppraisal,
  } = useIPA({ mode: "detail" });

  const columns =
    "Open" == "Open"
      ? [
          {
            dataField: "jobObjective",
            text: "Job Objective",
            sort: true,
          },
          {
            dataField: "keyPerformanceIndicators",
            text: "Key Performance Indicator(s)",
            sort: true,
          },
          {
            dataField: "deliverables",
            text: "Measures/Deliverables",
            sort: true,
          },
          {
            dataField: "byWhichTargetDate",
            text: "By which Target Date?",
            sort: true,
          },
          formData.status === "Open" && {
            dataField: "action",
            isDummyField: true,
            text: "Action",
            formatter: (cellContent, row) => {
              console.log("Cell Content:", cellContent);
              return (
                <ActionFormatterLines
                  row={row}
                  companyId={companyId}
                  apiHandler={apiIPALInes}
                  handleEditLine={(row: any) =>
                    handleEditLine(row as IPALineFormData)
                  }
                  handleDeleteLine={handleDeleteLine}
                  populateData={() => {
                    if (id) {
                      populateDocumentDetail(id);
                    }
                  }}
                />
              );
            },
          },
        ]
      : [
          {
            dataField: "jobObjective",
            text: "Job Objective",
            sort: true,
          },
          {
            dataField: "Initiatives",
            text: "Key Performance Indicator(s)",
            sort: true,
          },
          {
            dataField: "Measures",
            text: "Measures/Deliverables",
            sort: true,
          },
          {
            dataField: "TargetDate",
            text: "By which Target Date?",
            sort: true,
          },
        ];

  const handleDeleteLine = async () => {
    console.log("Delete Line");
  };

  useEffect(() => {
    if (id) {
      populateDocumentDetail(id);
    }
  }, [id]);

  return (
    <HeaderMui
      title="IPA Details"
      subtitle="Individual Performance Agreement"
      breadcrumbItem="Individual Performance Agreement"
      handleBack={() => navigate("/individual-performance-appraisal")}
      handleSubmit={() => {}}
      currentUser={
        formData.appraiser === employeeNo ? "Appraiser" : "Appraisee"
      }
      handleConvertToPerformanceAppraisal={() => {
        if (id) {
          convertToPerformanceAppraisal();
        }
      }}
      status={formData.status}
      stage={formData.stage}
      isLoading={false}
      tableId={50451}
      companyId={companyId}
      requestNo={formData.no || ""}
      documentType="Performance Management"
      pageType="detail"
      fields={getFormFields()}
      handleDeletePurchaseRequisition={() => {
        if (id) {
          deleteIPA(id);
        }
      }}
      handleSendApprovalRequest={() => {
        if (id) {
          sendIPAForApproval(id);
        }
      }}
      handleCancelApprovalRequest={() => {
        if (id) {
          cancelIPAApprovalRequest(id);
        }
      }}
      lines={
        <Lines
          documentName="Individual Performance Appraisal"
          title="IPA Lines"
          subTitle="IPA Lines"
          breadcrumbItem="IPA Lines"
          addLabel="Add Line"
          iconClassName=""
          noDataMessage="No lines found"
          clearLineFields={() => clearLineFields()}
          handleValidateHeaderFields={() => true}
          data={
            lines.map((line) => ({
              ...line,
              documentType: "Individual Performance Appraisal",
            })) as any
          }
          columns={columns}
          status={formData.status || ""}
          addLink={"/ipa/add"}
          modalFields={getLineFields()}
          handleSubmitLines={() => {
            if (id) {
              submitIPALines(id);
            }
          }}
          handleDeleteLines={() => {}}
          handleSubmitUpdatedLine={() => {
            if (id) {
              updateIPALines(id);
            }
          }}
        />
      }
    />
  );
}

export default IPADetails;
