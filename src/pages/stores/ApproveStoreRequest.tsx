import { useNavigate, useParams } from "react-router-dom";
import { useAppSelector } from "../../store/hook";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import HeaderMui from "../../Components/ui/Header/HeaderMui";
import Lines from "../../Components/ui/Lines/Lines";
import { apiLocation, apiDimensionValue } from "../../services/CommonServices";
import { apiGetStoreRequest } from "../../services/StoreRequestServices";
import { getErrorMessage } from "../../utils/common";
import { environmentType } from "../../configs/navigation.config/app.config";

function ApproveStoreRequest() {
  const navigate = useNavigate();
  const { documentNo } = useParams();
  const { companyId } = useAppSelector((state) => state.auth.session);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [selectedLocationType, setSelectedLocationType] = useState<string>("");
  const [selectedTransferTo, setSelectedTransferTo] = useState<string>("");
  const [selectedDimension, setSelectedDimension] = useState<string>("");
  const [requisitionType, setRequisitionType] = useState<string>("");
  const [purpose, setPurpose] = useState<string>("");
  const [transitCode, setTransitCode] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [requestNo, setRequestNo] = useState<string>("");
  const [storeRequestLines, setStoreRequestLines] = useState([]);
  const [requestorName, setRequestorName] = useState<string>("");
  const [requestorNo, setRequestorNo] = useState<string>("");

  const fields = [
    [
      {
        label: "Requisition No",
        type: "text",
        value: requestNo,
        disabled: true,
        id: "requestNo",
      },
      {
        label: "Requestor No",
        type: "text",
        value: requestorNo,
        disabled: true,
        id: "requestorNo",
      },
      {
        label: "Requestor Name",
        type: "text",
        value: requestorName,
        disabled: true,
        id: "requestorName",
      },
      {
        label: environmentType === "HRP" ? "Department" : "Project Code",
        type: "text",
        value: selectedDimension,
        disabled: true,
        id: "projectCode",
      },
    ],
    [
      {
        label: "Requisition Type",
        type: "text",
        value: requisitionType,
        disabled: true,
        id: "requisitionType",
      },
      {
        label: "Location Code",
        type: "text",
        value: selectedLocationType,
        disabled: true,
        id: "location",
      },
      ...(requisitionType === "Transfer Order"
        ? [
            {
              label: "Transfer To",
              type: "text",
              value: selectedTransferTo,
              disabled: true,
              id: "transferTo",
            },
            {
              label: "Transit Code",
              type: "text",
              value: transitCode,
              disabled: true,
              id: "transitCode",
            },
          ]
        : []),
      {
        label: "Purpose",
        type: "textarea",
        value: purpose,
        disabled: true,
        rows: 2,
        id: "purpose",
      },
      {
        label: "Status",
        type: "text",
        value: status,
        disabled: true,
        id: "docStatus",
      },
    ],
  ];

  const columns = [
    {
      dataField: "description2",
      text: "Description",
      sort: true,
    },
    {
      dataField: "quantity",
      text: "Quantity",
      sort: true,
    },
    {
      dataField: "unitOfMeasure",
      text: "Unit of Measure",
      sort: true,
    },
  ];

  const populateData = async () => {
    try {
      setIsLoading(true);
      if (documentNo) {
        // const filter = `$expand=purchaseRequisitionLines&$filter=no eq '${documentNo}'`;

        const filter = `$expand=storeRequestline&$filter=no eq '${documentNo}'`;
        const response = await apiGetStoreRequest(companyId, filter);
        console.log("response:", response);
        const data = response.data.value[0];

        setRequestNo(data.no || "");
        setStatus(data.status || "");
        setPurpose(data.purpose || "");
        setTransitCode(data.transitCode || "");
        setRequisitionType(data.storeReqType || "");
        setRequestorNo(data.requestorNo || "");
        setRequestorName(data.requestorName || "");
        setStoreRequestLines(data.storeRequestline || []);

        // Fetch and set location names
        const resLocationCodes = await apiLocation(companyId);
        resLocationCodes.data.value.forEach((e) => {
          if (e.code === data.locationCode) {
            setSelectedLocationType(`${e.code}:${e.name}`);
          }
          if (e.code === data.transferTo) {
            setSelectedTransferTo(`${e.code}:${e.name}`);
          }
        });

        // Fetch and set dimension value
        const resDimension = await apiDimensionValue(companyId);
        resDimension.data.value.forEach((e) => {
          if (e.code === data.globalDimension1Code) {
            setSelectedDimension(`${e.code}:${e.name}`);
          }
        });
      }
    } catch (error) {
      toast.error(`Error fetching data: ${getErrorMessage(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    populateData();
  }, [documentNo, companyId]);

  return (
    <HeaderMui
      title="Store Requisition Approval"
      subtitle="Store Requisition Approval"
      breadcrumbItem="Store Requisition Approval"
      fields={fields}
      isLoading={isLoading}
      handleBack={() => navigate("/approvals")}
      pageType="approval"
      status={status}
      companyId={companyId}
      documentType="Store Requisition"
      requestNo={requestNo}
      tableId={50134}
      lines={
        <Lines
          title="Store Requisition Lines"
          subTitle="Store Requisition Lines"
          breadcrumbItem="Store Requisition Lines"
          data={storeRequestLines}
          columns={columns}
          noDataMessage="No Store Requisition Lines found"
          status={""}
          modalFields={[]}
          addLink={""}
          addLabel={""}
          iconClassName="fa fa-file-text"
          handleSubmitLines={() => {}}
          handleSubmitUpdatedLine={() => {}}
          clearLineFields={() => {}}
          handleValidateHeaderFields={() => {
            return true;
          }}
        />
      }
    />
  );
}

export default ApproveStoreRequest;
