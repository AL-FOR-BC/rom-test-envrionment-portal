import { useEffect, useState } from "react";
import TableMui from "../../../Components/ui/Table/TableMui";
import { usePA } from "./hooks/usePA";
import { PA } from "../../../@types/pa.dto";
import {
  ActionFormatter,
  statusFormatter,
} from "../../../Components/ui/Table/TableUtils";
import { useAppSelector } from "../../../store/hook";

type Column = {
  dataField: keyof PA | "action" | "appraiseeFullNames" | "appraiserNames";
  text: string;
  sort: boolean;
  formatter?: any;
  action?: (cell: string, row: any) => JSX.Element;
};

function PaReview() {
  const [data, setData] = useState<PA[]>([]);
  const [loading, setLoading] = useState(false);
  const { getPA } = usePA({ mode: "list" });
  const { employeeNo } = useAppSelector((state) => state.auth.user);

  const columns: Column[] = [
    {
      dataField: "no",
      text: "Document No",
      sort: true,
    },
    {
      dataField: "employeeNo",
      text: "Employee No",
      sort: true,
    },
    {
      dataField: "appraiseeFullNames",
      text: "Appraisee Name",
      sort: true,
    },
    {
      dataField: "appraiserNames",
      text: "Appraiser Name",
      sort: true,
    },
    {
      dataField: "performanceYear",
      text: "Performance Year",
      sort: true,
    },
    {
      dataField: "appraisalPeriod",
      text: "Appraisal Period",
      sort: true,
    },
    {
      dataField: "stage",
      text: "Stage",
      sort: true,
      formatter: (cell: string, row: any) => {
        console.log(row);
        return (
          <>
            {cell === "Appraisee Rating" ? (
              <span className="badge bg-info">Appraisee Rating</span>
            ) : cell === "Appraiser Rating" ? (
              <span className="badge bg-warning">Appraiser Rating</span>
            ) : cell === "Head of Department Review" ? (
              <span className="badge bg-primary">
                Head of Department Review
              </span>
            ) : (
              <span className="badge bg-secondary">{cell}</span>
            )}
          </>
        );
      },
    },
    {
      dataField: "status",
      text: "Status",
      sort: true,
      formatter: statusFormatter,
    },
    {
      dataField: "action",
      text: "Action",
      sort: true,
      formatter: (cell: string, row: any) => {
        return (
          <ActionFormatter
            row={row}
            cellContent={cell}
            navigateTo="/pa-details"
          />
        );
      },
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await getPA();
      try {
        // For review page, we might want to show all PAs or filter differently
        // For now, showing all PAs (you can adjust the filter logic as needed)
        const filteredResult = result.filter(
          (item) =>
            (item.appraiser === employeeNo &&
              item.stage === "Appraiser Rating") ||
            (item.headOfDepartment === employeeNo &&
              item.stage === "Head of Department Review")
        );
        console.log(filteredResult);
        setData(filteredResult || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <TableMui
      title="Performance Appraisal Review"
      subTitle="List of Performance Appraisals for Review"
      addLink=""
      addLabel=""
      data={data}
      columns={columns}
      breadcrumbItem="Performance Appraisal Review"
      noDataMessage="No Performance Appraisals found for review"
      iconClassName="fa fa-chart-line"
      isLoading={loading}
    />
  );
}

export default PaReview;
