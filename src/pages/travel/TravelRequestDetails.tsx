import React, { useEffect, useState } from "react";
// import Header from '../../Components/ui/Header/Header';
import Lines from "../../Components/ui/Lines/Lines";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { useNavigate, useParams } from "react-router-dom";
import {
  apiBankAccountsApi,
  apiCurrencyCodes,
  apiCustomersApi,
  apiDimensionValue,
  apiEmployees,
  apiGLAccountsApi,
  apiPaymentCategory,
  apiPaymentSubCategoryApi,
  apiWorkPlanLines,
  apiWorkPlans,
} from "../../services/CommonServices";
import { toast } from "react-toastify";
import {
  apiCreateTravelRequestsLines,
  apiTravelRequestDetail,
  apiTravelRequests,
  apiTravelRequestsLines,
  apiUpdateTravelRequests,
} from "../../services/TravelRequestsService";

import {
  cancelApprovalButton,
  // decodeValue,
  getErrorMessage,
} from "../../utils/common";
import {
  closeModalRequisition,
  editRequisitionLine,
  modelLoadingRequisition,
  openModalRequisition,
} from "../../store/slices/Requisitions";
import Swal from "sweetalert2";
import { ActionFormatterLines } from "../../Components/ui/Table/TableUtils";
import { handleSendForApproval } from "../../actions/actions";
import { options } from "../../@types/common.dto";
import { split } from "lodash";
import HeaderMui from "../../Components/ui/Header/HeaderMui";
import { environmentType } from "../../configs/navigation.config/app.config";

function TravelRequestDetails() {
  const { id } = useParams();

  const { companyId } = useAppSelector((state) => state.auth.session);
  const dispatch = useAppDispatch();

  const { employeeNo, employeeName, email } = useAppSelector(
    (state) => state.auth.user
  );
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<options[]>([]);
  const [selectedWorkPlan, setSelectedWorkPlan] = useState<options[]>([]);
  const [selectedPaymentCategory, setSelectedPaymentCategory] = useState<
    options[]
  >([]);
  const [selectedDimension, setSelectedDimension] = useState<options[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState<options[]>([]);
  const [lineSystemId, setLineSystemId] = useState<string>("");
  const [lineEtag, setLineEtag] = useState<string>("");
  // const [selectedBankAccount, setSelectedBankAccount] = useState < options[] > ([]);
  // const [selectedCustomer, setSelectedCustomer] = useState < options[] > ([]);
  const [requestNo, setRequest] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [travelRequisitionLines, setTravelRequisitionLines] = useState<any[]>(
    []
  );

  // const [customerOptions, setCustomerOptions] = useState < options[] > ([]);
  const [dimensionValues, setDimensionValues] = useState<options[]>([]);
  const [paymentSubCategory, setPaymentSubCategory] = useState<options[]>([]);
  // const [bankAccountOptions, setBankAccountOptions] = useState < options[] > ([]);
  const [currencyOptions, setCurrencyOptions] = useState<options[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<options[]>([]);

  const [workPlans, setWorkPlans] = useState<
    { label: string; value: string }[]
  >([]);
  const [paymentCategoryOptions, setPaymentCategoryOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [description, setDescription] = useState<string>("");
  const [lineDescription, setLineDescription] = useState<string>("");
  const [expectedReceiptDate, setExpectedReceiptDate] = useState<Date>(
    new Date()
  );
  // const [selectedCurrencyCode, setSelectedCurrencyCode] = useState < string > ('');
  const [selectedDelegatee, setSelectedDelegatee] = useState<options[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<options[]>([]);
  const [rate, setRate] = useState<number>(0);
  // const [directUnitCost, setDirectUnitCost] = useState < number > (0);
  const [selectedAccountNo, setSelectedAccountNo] = useState<options[]>([]);
  const [workPlanLines, setWorkPlanLines] = useState<options[]>([]);
  const [selectedWorkPlanLine, setSelectedWorkPlanLine] = useState<options[]>(
    []
  );
  const [noOfNights, setNoOfNights] = useState<number>(0);
  const accountTypeOptions: options[] = [
    { label: "G/L Account", value: "G/L Account" },
    // { label: 'Bank Account', value: 'Bank Account' }
  ];
  const [accountType, setAccountType] = useState<options[]>([]);
  const [glAccounts, setGlAccounts] = useState<options[]>([]);

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [budgetCode, setBudgetCode] = useState<string>("");

  const fields = [
    [
      {
        label: "Request No",
        type: "text",
        value: requestNo,
        disabled: true,
        id: "requestNo",
      },
      {
        label: "Requestor No",
        type: "text",
        value: employeeNo,
        disabled: true,
        id: "empNo",
      },
      {
        label: "Requestor Name",
        type: "text",
        value: employeeName,
        disabled: true,
        id: "empName",
      },

      {
        label: "Document Date",
        type: "date",
        disabled: status === "Open" ? false : true,
        value: expectedReceiptDate,
        onChange: (e: Date) => setExpectedReceiptDate(e),
        id: "documentDate",
        onBlur: (e: Date) => {
          quickUpdate({
            documentDate: e,
          });
        },
      },
    ],

    [
      {
        label: environmentType === "HRP" ? "Department" : "Project Code",
        type: "select",
        disabled: status === "Open" ? false : true,
        options: dimensionValues,
        onChange: async (e: options) => {
          if (travelRequisitionLines.length > 0) {
            Swal.fire({
              title: "Are you sure?",
              text: "Changing the department code will delete all existing lines. This action cannot be undone!",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "Yes, delete all lines!",
            }).then(async (result) => {
              if (result.isConfirmed) {
                setSelectedDimension([{ label: e.label, value: e.value }]);
                quickUpdate({
                  projectCode: e.value,
                });
                setSelectedWorkPlan([]);
                setBudgetCode("");
                const resWorkPlans = await apiWorkPlans(companyId);
                let workPlansOptions: options[] = [];
                resWorkPlans.data.value.map((plan) => {
                  if (split(plan.shortcutDimension1Code, "::")[1] == e.value) {
                    workPlansOptions.push({
                      label: `${plan.no}::${plan.description}`,
                      value: `${plan.no}::${plan.shortcutDimension1Code}`,
                    });
                  }
                });
                setWorkPlans(workPlansOptions);
              }
            });
          } else if (
            selectedDimension.length !== 0 &&
            selectedDimension[0].value !== e.value
          ) {
            Swal.fire({
              title: "Are you sure?",
              text: "Changing the project code will require you to re-select the work plan",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "Yes, change project code!",
            }).then(async (result) => {
              if (result.isConfirmed) {
                quickUpdate({
                  projectCode: e.value,
                });
                setSelectedDimension([{ label: e.label, value: e.value }]);
                setSelectedWorkPlan([]);
                setBudgetCode("");
              }
            });
          } else {
            quickUpdate({
              projectCode: e.value,
            });
            setSelectedDimension([{ label: e.label, value: e.value }]);
            const resWorkPlans = await apiWorkPlans(companyId);
            let workPlansOptions: options[] = [];
            resWorkPlans.data.value.map((plan) => {
              if (plan.shortcutDimension1Code === e.value) {
                workPlansOptions.push({
                  label: `${plan.no}::${plan.description}`,
                  value: `${plan.no}::${plan.shortcutDimension1Code}`,
                });
              }
            });
            setWorkPlans(workPlansOptions);
          }
        },
        id: "projectCode",
        value: selectedDimension,
      },

      {
        label: "Payment Category",
        type: "select",
        value: selectedPaymentCategory,
        options: paymentCategoryOptions,
        disabled: status === "Open" ? false : true,
        onChange: (e: options) => {
          setSelectedPaymentCategory([{ label: e.label, value: e.value }]);
          setSelectedSubCategory([]);
          // setSelectedCustomer([])
          // setSelectedBankAccount([])
        },
        onBlur: (e: options) => {
          quickUpdate({
            paymentCategory: e.value,
          });
        },
        id: "paymentCategory",
      },
      {
        label: "Payment Subcategory",
        type: "select",
        value: selectedSubCategory,
        disabled: status === "Open" ? false : true,
        options: paymentSubCategory.filter(
          (sub) => sub.value == selectedPaymentCategory[0]?.value
        ),
        onChange: (e: options) =>
          setSelectedSubCategory([{ label: e.label, value: e.value }]),
        id: "subCategory",
        onBlur: (e: options) => {
          quickUpdate({
            paymentSubCategory: e.value,
          });
        },
      },

      {
        label: "Payee",
        type: "select",
        value: selectedEmployee,
        options: employeeOptions,
        disabled: status === "Open" ? false : true,
        onChange: (e: options) => {
          setSelectedEmployee([{ label: e.label, value: e.value }]);
          quickUpdate({
            payeeNo: e.value,
          });
        },
        id: "payee",
      },
    ],
    // Third row of inputs
    [
      {
        label: "Work Plan",
        type: "select",
        value: selectedWorkPlan,
        onChange: (e: options) => {
          setSelectedWorkPlan([{ label: e.label, value: e.value }]);

          quickUpdate({
            workPlanNo: split(e.value, "::")[0],
          });
        },
        options: workPlans.filter(
          (plan) => split(plan.value, "::")[1] == selectedDimension[0]?.value
        ),
        disabled: status === "Open" ? false : true,
        id: "workPlan",
        // onBlur: (e: options) => {

        // },
      },
      {
        label: "Budget Code",
        type: "text",
        value: budgetCode,
        disabled: status === "Open" ? false : true,
        id: "budgetCode",
      },

      {
        label: "Currency",
        type: "select",
        value: selectedCurrency,
        options: currencyOptions,
        onChange: (e: options) => {
          if (travelRequisitionLines.length > 0) {
            Swal.fire({
              title: "Are you sure?",
              text: "Changing the currency will delete all existing lines. This action cannot be undone!",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "Yes, delete all lines!",
            }).then(async (result) => {
              if (result.isConfirmed) {
                setSelectedCurrency([{ label: e.label, value: e.value }]);
                quickUpdate({
                  currencyCode: e.value,
                });
              }
            });
          } else {
            setSelectedCurrency([{ label: e.label, value: e.value }]);
            quickUpdate({
              currencyCode: e.value,
            });
          }
        },
        disabled: status === "Open" ? false : true,
        id: "currency",
      },
      {
        label: "Start Date",
        type: "date",
        value: startDate,
        disabled: status === "Open" ? false : true,
        onChange: (e: string) => setStartDate(e),
        id: "startDate",
        onBlur: (e: string) => {
          quickUpdate({
            travelStartDate: e,
          });
        },
      },
      {
        label: "End Date",
        type: "date",
        value: endDate,
        disabled: status === "Open" ? false : true,
        onChange: (e: string) => setEndDate(e),
        id: "endDate",
        onBlur: (e: string) => {
          quickUpdate({
            travelEndDate: e,
          });
        },
      },
      {
        label: "Delegatee",
        type: "select",
        value: selectedDelegatee,
        options: employeeOptions,
        onChange: (e: options) =>
          setSelectedDelegatee([{ label: e.label, value: e.value }]),
        id: "delegatee",
        disabled: status === "Open" ? false : true,
        onBlur: (e: string) => {
          quickUpdate({
            delegatee: e,
          });
        },
      },
      {
        label: "Purpose",
        type: "textarea",
        value: description,
        disabled: status === "Open" ? false : true,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          setDescription(e.target.value),
        id: "purpose",
        rows: 2,
        onBlur: (e: React.ChangeEvent<HTMLInputElement>) => {
          quickUpdate({
            purpose: e.target.value,
          });
        },
      },
    ],
  ];

  const columns =
    status == "Open"
      ? [
          {
            dataField: "accountType",
            text: "Account Type",
            sort: true,
          },
          {
            dataField: "accountNo",
            text: "Account No",
            sort: true,
          },
          {
            dataField: "accountName",
            text: "Account Name",
            sort: true,
          },
          {
            dataField: "description",
            text: "Description",
            sort: true,
          },
          {
            dataField: "noOfNights",
            text: "No of Nights",
            sort: true,
          },
          {
            dataField: "rate",
            text: "Rate",
            sort: true,
            formatter: (cell) => {
              return parseInt(cell).toLocaleString();
            },
          },
          {
            dataField: "amount",
            text: "Amount",
            sort: true,
            formatter: (cell) => {
              return parseInt(cell).toLocaleString();
            },
          },
          // {
          //   dataField: "ShortcutDimCode1",
          //   text: environmentType === "HRP" ? "Department" : "Project Code",
          //   sort: true,
          // },
          // {
          //   dataField: "ShortcutDimCode2",
          //   text: environmentType === "HRP" ? "Cost Center" : "Donor Code",
          //   sort: true,
          // },
          {
            dataField: "ShortcutDimCode4",
            text: "Activity Code",
            sort: true,
          },
          {
            dataField: "action",
            isDummyField: true,
            text: "Action",
            formatter: (column, row) => (
              console.log("column", column),
              (
                <ActionFormatterLines
                  row={row}
                  companyId={companyId}
                  apiHandler={apiTravelRequestsLines}
                  handleEditLine={handleEditLine}
                  handleDeleteLine={handleDelteLine}
                  populateData={populateData}
                />
              )
            ),
          },
        ]
      : [
          {
            dataField: "accountType",
            text: "Account Type",
            sort: true,
          },
          {
            dataField: "accountNo",
            text: "Account No",
            sort: true,
          },
          {
            dataField: "accountName",
            text: "Account Name",
            sort: true,
          },
          {
            dataField: "description",
            text: "Description",
            sort: true,
          },
          {
            dataField: "noOfNights",
            text: "No of Nights",
            sort: true,
          },
          {
            dataField: "rate",
            text: "Rate",
            sort: true,
            formatter: (cell) => {
              return parseInt(cell).toLocaleString();
            },
          },
          {
            dataField: "amount",
            text: "Amount",
            sort: true,
            formatter: (cell) => {
              return parseInt(cell).toLocaleString();
            },
          },
          // {
          //   dataField: "ShortcutDimCode1",
          //   text: environmentType === "HRP" ? "Department" : "Project Code",
          //   sort: true,
          // },
          // {
          //   dataField: "ShortcutDimCode2",
          //   text: environmentType === "HRP" ? "Cost Center" : "Donor Code",
          //   sort: true,
          // },
          {
            dataField: "ShortcutDimCode4",
            text: "Activity Code",
            sort: true,
          },
        ];

  const modalFields = [
    [
      {
        label: "Account Type",
        type: "select",
        value: accountType,
        options: accountTypeOptions,
        readOnly: true,
        disabled: false,
        onChange: async (e: options) => {
          setSelectedAccountNo([]);
          setSelectedWorkPlanLine([]);
          dispatch(modelLoadingRequisition(true));
          setAccountType([{ label: e.label, value: e.value }]);
          const glAccounts = await apiGLAccountsApi(companyId);
          let glAccountsOptions: options[] = [];
          glAccounts.data.value.map((e) => {
            glAccountsOptions.push({
              label: `${e.no}::${e.name}`,
              value: e.no,
            });
          });
          setGlAccounts(glAccountsOptions);
          dispatch(modelLoadingRequisition(false));
        },

        style: { backgroundColor: "grey" },
      },
      {
        label: "Account No",
        type: "select",
        value: selectedAccountNo,
        onChange: async (e: options) => {
          setSelectedWorkPlanLine([]);
          dispatch(modelLoadingRequisition(true));
          setSelectedAccountNo([{ label: e.label, value: e.value }]);
          const filterQuery = `$filter=workPlanNo eq '${
            split(selectedWorkPlan[0].value, "::")[0]
          }' and accountNo eq '${e?.value}'`;
          const workPlanLines = await apiWorkPlanLines(companyId, filterQuery);
          let workPlanLinesOptions: options[] = [];
          workPlanLines.data.value.map((e) => {
            workPlanLinesOptions.push({
              label: e.entryNo + ":: " + e.activityDescription,
              value: `${e.entryNo}`,
            });
          });
          setWorkPlanLines(workPlanLinesOptions);
          dispatch(modelLoadingRequisition(false));
        },
        options: glAccounts,
        isSearchable: true,
      },
      {
        label: "Work Entry No",
        type: "select",
        value: selectedWorkPlanLine,
        options: workPlanLines,
        disabled: false,
        onChange: (e: options) =>
          setSelectedWorkPlanLine([{ label: e.label, value: e.value }]),
      },
    ],
    [
      {
        label: "No of Nights",
        type: "number",
        value: noOfNights.toString(),
        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          setNoOfNights(Number(e.target.value)),
      },
      {
        label: "Rate",
        type: "number",
        value: rate.toString(),
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          if (Number(e.target.value) < 0) {
            toast.error("Rate cannot be negative");
            return;
          }
          setRate(Number(e.target.value.replace(/,/g, "")));
        },
      },

      {
        label: "Description",
        type: "textarea",
        rows: 2,
        value: lineDescription,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          setLineDescription(e.target.value),
      },
    ],
  ];
  const populateData = async () => {
    try {
      setIsLoading(true);

      const resEmployee = await apiEmployees(companyId);
      let employeeOptions: options[] = [];
      resEmployee.data.value.map((e) => {
        employeeOptions.push({
          label: `${e.No}::${e.LastName}-${e.FirstName}`,
          value: e.No,
        });
      });
      setEmployeeOptions(employeeOptions);

      const resWorkPlans = await apiWorkPlans(companyId);
      setWorkPlans(
        resWorkPlans.data.value.map((plan) => ({
          label: `${plan.no}::${plan.description}`,
          value: `${plan.no}::${plan.shortcutDimension1Code}`,
        }))
      );

      const dimensionFilter = `&$filter=globalDimensionNo eq 1`;
      const resDimensionValues = await apiDimensionValue(
        companyId,
        dimensionFilter
      );
      let dimensionValues: options[] = [];
      resDimensionValues.data.value.map((e) => {
        dimensionValues.push({ label: `${e.code}::${e.name}`, value: e.code });
      });
      setDimensionValues(dimensionValues);

      if (id) {
        const filterQuery = `$expand=travelRequisitionLines`;
        const res = await apiTravelRequestDetail(companyId, id, filterQuery);
        if (res.data.no) {
          setRequest(res.data.no);
          setStatus(res.data.status);
          setDescription(res.data.purpose);
          setStartDate(res.data.travelStartDate.split("T")[0]);
          setEndDate(res.data.travelEndDate.split("T")[0]);
          setSelectedCurrency([
            { label: res.data.currencyCode, value: res.data.currencyCode },
          ]);
          setSelectedPaymentCategory([
            {
              label: res.data.paymentCategory,
              value: res.data.paymentCategory,
            },
          ]);
          setSelectedSubCategory([
            { label: res.data.paySubcategory, value: res.data.paySubcategory },
          ]);
          setBudgetCode(res.data.budgetCode);

          employeeOptions.map((e) => {
            if (e.value === res.data.delegatee) {
              setSelectedDelegatee([{ label: e.label, value: e.value }]);
            }
          });

          employeeOptions.map((e) => {
            if (e.value === res.data.payeeNo) {
              setSelectedEmployee([{ label: e.label, value: e.value }]);
            }
          });

          resWorkPlans.data.value.map((e) => {
            if (e.no === res.data.workPlanNo) {
              setSelectedWorkPlan([
                { label: `${e.no}::${e.description}`, value: e.no },
              ]);
            }
          });

          dimensionValues.map((e) => {
            if (e.value === res.data.projectCode) {
              setSelectedDimension([{ label: e.label, value: e.value }]);
            }
          });

          // setSelectedBankAccount([{ label: res.data.payeeNo, value: res.data.payeeNo }])
          setSelectedCurrency(
            res.data.currencyCode === ""
              ? [{ label: "UGX", value: "" }]
              : [{ label: res.data.currencyCode, value: res.data.currencyCode }]
          );
          setTravelRequisitionLines(res.data.travelRequisitionLines);
        }
      }

      const resCurrencyCodes = await apiCurrencyCodes(companyId);
      let currencyOptions = [{ label: "UGX", value: "" }]; // Add UGX as the first option
      resCurrencyCodes.data.value.map((e) => {
        currencyOptions.push({ label: e.code, value: e.code });
      });
      setCurrencyOptions(currencyOptions);

      const resPaymentSubCategory = await apiPaymentSubCategoryApi(companyId);
      let paymentSubCategoryOptions: options[] = [];
      resPaymentSubCategory.data.value.map((e) => {
        paymentSubCategoryOptions.push({ label: e.name, value: e.code });
      });
      setPaymentSubCategory(paymentSubCategoryOptions);

      const resPaymentCategory = await apiPaymentCategory(companyId);
      let paymentCategoryOptions: options[] = [];
      resPaymentCategory.data.value.map((e) => {
        console.log(e.code);
        if (e.code === "TRAVEL") {
          paymentCategoryOptions.push({ label: e.description, value: e.code });
        }
      });
      setPaymentCategoryOptions(paymentCategoryOptions);

      const customerFilter = `&$filter=staff eq true`;
      const resCustomers = await apiCustomersApi(companyId, customerFilter);
      let customerOptions: options[] = [];
      resCustomers.data.value.map((e) => {
        customerOptions.push({ label: `${e.no}::${e.name}`, value: e.no });
      });
      // setCustomerOptions(customerOptions)

      const resBankAccounts = await apiBankAccountsApi(companyId);
      let bankAccountOptions: options[] = [];
      resBankAccounts.data.value.map((e) => {
        bankAccountOptions.push({ label: `${e.no}::${e.name}`, value: e.no });
      });
      // setBankAccountOptions(bankAccountOptions)
    } catch (error) {
      toast.error(`Error fetching data requisitions:${error}`);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    populateData();
  }, []);

  const quickUpdate = async (kwargs: any) => {
    try {
      if (id) {
        const res = await apiUpdateTravelRequests(
          companyId,
          id,
          {
            ...kwargs,
          },
          "*"
        );
        if (res.status == 200) {
          toast.success("Travel request updated successfully");
          populateData();
        }
      }
    } catch (error) {
      toast.error(`Error updating travel request:${getErrorMessage(error)}`);
    }
  };

  const updatedLineAfterBudgetCheck = async (
    systemId?: string,
    etag?: string
  ) => {
    try {
      const data = {
        noOfNights: noOfNights,
        rate: rate,
      };
      const res = await apiTravelRequestsLines(
        companyId,
        "PATCH",
        data,
        systemId,
        etag
      );
      if (res.status == 200) {
        toast.success("Line updated successfully");
        populateData();
      }
    } catch (error) {
      toast.error(`Error updating line:${error}`);
    }
  };

  const handleSubmitLines = async () => {
    if (selectedAccountNo.length === 0) {
      toast.error(`Please select an account`);
      return;
    }
    if (selectedWorkPlanLine.length === 0) {
      toast.error(`Please select a work plan line`);
      return;
    }
    if (rate == 0) {
      toast.error(`Please enter the rate`);
      return;
    }
    if (noOfNights == 0) {
      toast.error(`Please enter the no of nights`);
      return;
    }
    if (lineDescription == "") {
      toast.error(`Please enter a description`);
      return;
    }

    try {
      const data = {
        accountNo: selectedAccountNo[0].value,
        accountType: accountType[0].value,
        workPlanEntryNo: split(selectedWorkPlanLine[0].value, "::")[0],
        documentNo: requestNo,
        description: lineDescription,
        workPlanNo: split(selectedWorkPlan[0].value, "::")[0],
      };
      const res = await apiCreateTravelRequestsLines(companyId, data);
      console.log(res.data);
      if (res.status == 201) {
        updatedLineAfterBudgetCheck(
          res.data.systemId,
          res.data["@odata.etag"] ?? ""
        );
        toast.success("Line added successfully");
        populateData();
        dispatch(closeModalRequisition());
        clear();
      }
    } catch (error) {
      toast.error(`Error saving line:${getErrorMessage(error)}`);
      console.log(error);
    }
  };
  const handleDelteLine = async (row: any) => {
    Swal.fire({
      title: "Are you sure you want to delete this line?",
      showCancelButton: true,
      confirmButtonText: `Delete`,
      confirmButtonColor: "red",
      icon: "warning",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await apiTravelRequestsLines(
            companyId,
            "DELETE",
            "",
            row.systemId,
            row["@odata.etag"]
          );
          if (res.status == 204) {
            toast.success("Line deleted successfully");
            populateData();
          }
        } catch (error) {
          toast.error(`Error deleting line:${error}`);
        }
      }
    });
  };

  const clear = () => {
    setAccountType([]);
    setSelectedAccountNo([]);
    setSelectedWorkPlanLine([]);
    setRate(0);
    setNoOfNights(0);
    setLineDescription("");
  };
  const handleEditLine = async (row: any) => {
    console.log("handleEditLine", row);
    dispatch(openModalRequisition());
    dispatch(modelLoadingRequisition(true));
    dispatch(editRequisitionLine(true));
    clear();
    setAccountType([{ label: row.accountType, value: row.accountType }]);
    setLineSystemId(row.systemId);
    setLineEtag(row["@odata.etag"]);

    const glAccounts = await apiGLAccountsApi(companyId);

    const glAccountsOptions = glAccounts.data.value.map((account) => ({
      label: `${account.no}::${account.name}`,
      value: account.no,
    }));
    setGlAccounts(glAccountsOptions);
    const glAccountData = glAccountsOptions.filter(
      (e) => e.value === row.accountNo
    );
    glAccountData.length > 0
      ? setSelectedAccountNo([
          { label: glAccountData[0].label, value: glAccountData[0].value },
        ])
      : setSelectedAccountNo([{ label: "", value: "" }]);

    const filterQuery = `$filter=workPlanNo eq '${
      split(selectedWorkPlan[0].value, "::")[0]
    }' and accountNo eq '${row.accountNo}'`;
    const workPlanEntryNoRes = await apiWorkPlanLines(companyId, filterQuery);

    const workPlanLines = workPlanEntryNoRes.data.value.map((plan) => ({
      label: `${plan.entryNo}::${plan.activityDescription}`,
      value: `${plan.entryNo}`,
    }));
    setWorkPlanLines(workPlanLines);

    const workPlanEntryNo = workPlanLines.filter(
      (e) => e.value === row.workPlanEntryNo.toString()
    );
    workPlanEntryNo.length > 0
      ? setSelectedWorkPlanLine([
          { label: workPlanEntryNo[0].label, value: workPlanEntryNo[0].value },
        ])
      : setSelectedWorkPlanLine([{ label: "", value: "" }]);
    setRate(row.rate);
    setNoOfNights(row.noOfNights);
    setLineDescription(row.description);

    dispatch(modelLoadingRequisition(false));
  };

  const handleSubmitUpdatedLine = async () => {
    if (selectedAccountNo.length === 0) {
      toast.error(`Please select an account`);
      return;
    }
    if (selectedWorkPlanLine.length === 0) {
      toast.error(`Please select a work plan line`);
      return;
    }
    if (rate == 0) {
      toast.error(`Please enter the rate`);
      return;
    }
    if (noOfNights == 0) {
      toast.error(`Please enter the no of nights`);
      return;
    }
    if (description == "") {
      toast.error(`Please enter a description`);
      return;
    }

    try {
      const data = {
        accountNo: selectedAccountNo[0].value,
        accountType: accountType[0].value,
        workPlanEntryNo: split(selectedWorkPlanLine[0].value, "::")[0],
        documentNo: requestNo,
        description: lineDescription,
        rate: rate,
        noOfNights: noOfNights,
      };
      const res = await apiTravelRequestsLines(
        companyId,
        "PATCH",
        data,
        lineSystemId,
        lineEtag
      );
      if (res.status == 200) {
        toast.success("Line updated successfully");
        populateData();
        clear();
        dispatch(closeModalRequisition());
      }
    } catch (error) {
      toast.error(`Error saving line:${getErrorMessage(error)}`);
      console.log(error);
    }
  };

  const handleDeleteTravelRequest = async () => {
    Swal.fire({
      title: "Are you sure you want to delete this travel request?",
      showCancelButton: true,
      confirmButtonText: `Delete`,
      confirmButtonColor: "red",
      icon: "warning",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await apiTravelRequests(
            companyId,
            "DELETE",
            undefined,
            undefined,
            id
          );
          if (res.status == 204) {
            toast.success("Travel request deleted successfully");
            navigate("/travel-requests");
          }
        } catch (error) {
          toast.error(`Error deleting travel request:${error}`);
        }
      }
    });
  };

  const handleValidateHeaderFields = () => {
    const requiredFields = [
      { value: selectedDelegatee[0]?.value, name: "Delegatee" },
      { value: startDate, name: "Start Date" },
      { value: endDate, name: "End Date" },
      { value: description, name: "Description" },
      // { value: selectedCurrency[0]?.value, name: 'Currency' },
      { value: selectedPaymentCategory[0]?.value, name: "Payment Category" },
      { value: selectedSubCategory[0]?.value, name: "Payment Sub Category" },
      { value: budgetCode, name: "Budget Code" },
      { value: selectedEmployee[0]?.value, name: "Employee" },
      {
        value: selectedDimension[0]?.value,
        name: environmentType === "HRP" ? "Department" : "Project Code",
      },
      { value: selectedWorkPlan[0]?.value, name: "Work Plan" },
    ];

    const missingFields = requiredFields
      .filter((field) => !field.value || field.value === "")
      .map((field) => field.name);

    if (missingFields.length > 0) {
      toast.error(
        `Please fill in the missing fields: ${missingFields.join(", ")}`
      );
      return false;
    }

    return true;
  };

  return (
    <>
      <HeaderMui
        title="Travel Request Detail"
        subtitle="Purchase Request Detail"
        breadcrumbItem="Travel Request Detail"
        documentType="Travel_x0020_Requests"
        requestNo={requestNo}
        companyId={companyId}
        fields={fields}
        tableId={50108}
        isLoading={isLoading}
        handleBack={() => navigate("/travel-requests")}
        status={status}
        pageType="detail"
        handleCancelApprovalRequest={async () => {
          const documentNo = requestNo;
          const action = "cancelPaymentHeaderApprovalRequest";
          await cancelApprovalButton({
            companyId,
            data: { documentNo },
            action,
            populateDoc: populateData,
            documentLines: travelRequisitionLines,
          });
        }}
        handleSendApprovalRequest={async () => {
          const documentNo = requestNo;
          const documentLines = travelRequisitionLines;
          const link = "sendPaymtHeaderApprovalReqs";

          await handleSendForApproval(
            documentNo,
            email,
            documentLines,
            companyId,
            link,
            populateData
          );
        }}
        handleDeletePurchaseRequisition={handleDeleteTravelRequest}
        lines={
          <Lines
            title="Travel Request Lines"
            subTitle="Travel Request Lines"
            breadcrumbItem="Travel Request Lines"
            addLink=""
            addLabel=""
            noDataMessage="No lines found"
            iconClassName=""
            clearLineFields={clear}
            handleValidateHeaderFields={handleValidateHeaderFields}
            data={travelRequisitionLines}
            columns={columns}
            status={status}
            modalFields={modalFields}
            handleSubmitLines={handleSubmitLines}
            handleDeleteLines={handleDelteLine}
            handleSubmitUpdatedLine={handleSubmitUpdatedLine}
          />
        }
      />
    </>
  );
}
export default TravelRequestDetails;
