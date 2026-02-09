import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { MODULES } from "../../../config/modules/modules";
import { ResponsiveDialog } from "../../../components/ui/responsive-dialog";
import { useOpenChecklist } from "../../../hooks/useOpenChecklist";
import MasterlistLayout from "../../../components/layout/masterlist-layout/masterlist-layout";
import TableComponent, {
  ITableColumn,
} from "../../../components/ui/table/table";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import { JSX, useEffect, useState } from "react";
import { ContextMenuItem } from "../../../components/ui/context-menu/context-menu";
import {
  Check,
  Eye,
  ListBullets,
  ListChecks,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import StatusChip from "./status-chip";
import moment from "moment";

import { getChecklistData } from "../../../features/slices/qaDashboard-slice";
import {
  useForApprovalMutation,
  useGetQAQuery,
} from "../../../features/api/aurora/qa-dashboard.api";
import { IQADashboardResponse } from "../../../features/api/aurora/types/qa-dashboard-types";
import { ArrowCounterClockwise, MagnifyingGlass } from "@phosphor-icons/react";
import Typography from "@mui/material/Typography";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import ChecklistDialog from "../../(masterlist)/checklists/dialog/checklist-dialog";
import ForApprovalDialog from "./for-approval-dialog";
import ForSurveyApproverDialog from "../../survey-approver/dialog/for-survey-approver-dialog";
import AuroraSpinner from "../../../components/ui/aurora-spinner/aurora-spinner";
import { useApproveSurveyMutation } from "../../../features/api/aurora/survey-approver.api";
import Box from "@mui/material/Box";
import { ApproverRemarksDialog } from "./approver-remarks.dialog";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { SurveyReport } from "./survey-report";

type StoreChecklistsType = {
  weeksToAnswer: number[];
  uniqueId?: string | number;
  weekLen: number;
  currentMonday: number | null;
  mondayCount: number;
  store: string;
  grade: number;
  week: string;
  done_on: string;
  pendingLen: number;
  pendingArray: Array<{ week: number }>;
  approver_remarks: string;
  isRejectedWeek: number[];
  status:
    | "Completed"
    | "Pending"
    | "Overdue"
    | "For Approval"
    | "Rejected"
    | "Approved";
  qaItemData: IQADashboardResponse;
  checklistId: string;
  weekNumber: number;
  isOverdue: boolean;
  isOverdueNotAnswerable: boolean;
  isViewing: boolean;
  isActionsEnabled: boolean;
};

const QAChecklistDialog = () => {
  const QAVisits: StoreChecklistsType[] = [];
  const { isOpen: isQAItemOpen, close: closeQADialog } = useOpenChecklist();
  const [searchParams, setSearchParams] = useSearchParams();
  const [openReport, setOpenReport] = useState(false);
  const touchedData = useSelector(
    (state: RootState) => state.qaDashboard.touchedData,
  );
  const touchedChecklistData = useSelector(
    (state: RootState) => state.qaDashboard.checklistData,
  );
  const { currentParams } = useRememberQueryParams();
  const isApproverDashboard =
    useLocation().pathname.includes("approver_dashboard");
  const isSurveyApprover = currentParams?.dg === "view-survey-approver";
  const [forApprove, { isLoading }] = useForApprovalMutation();
  const [approve, { isLoading: isLoadingApprove }] = useApproveSurveyMutation();
  const {
    data: singleWeeklyRecord,
    isLoading: isSingleWeeklyRecordLoading,
    isFetching: isSingleWeeklyRecordFetching,
  } = useGetQAQuery(
    {
      id: touchedData?.id.toString() || "",
      month: (
        new Date(`${touchedData.month.toString()} 1, 2000`).getMonth() + 1
      ).toString(),
      year: touchedData.year.toString(),
      store_checklist_id:
        touchedData?.store_checklist?.[0]?.id.toString() || "",
    },
    {
      refetchOnMountOrArgChange: true,
      skip: !touchedData.isViewing,
    },
  );

  const { data: weeklyRecords } = useGetQAQuery(
    {
      id: touchedData?.id.toString() || "",
      month: (
        new Date(`${touchedData.month.toString()} 1, 2000`).getMonth() + 1
      ).toString(),
      year: touchedData.year.toString(),
      store_checklist_id:
        touchedData?.store_checklist?.[0]?.id.toString() || "",
    },
    {
      refetchOnMountOrArgChange: true,
      skip: !touchedChecklistData.isForApproving,
    },
  );
  const isAllApproved =
    weeklyRecords?.data?.store_checklist?.[0]?.weekly_record?.every(
      (week) => week.status === "Approved" || week.status === "Rejected",
    );
  useEffect(() => {
    saveTouchedData(touchedData);
  }, [touchedData]);
  useEffect(() => {
    if (
      isAllApproved &&
      !(
        isLoading ||
        isLoadingApprove ||
        isSingleWeeklyRecordLoading ||
        isSingleWeeklyRecordFetching
      ) &&
      isApproverDashboard
    ) {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("dg");
      newParams.delete("id");
      setSearchParams(newParams, { replace: true });
    }
  }, [
    isAllApproved,
    isLoading,
    isLoadingApprove,
    isSingleWeeklyRecordLoading,
    isSingleWeeklyRecordFetching,
    isApproverDashboard,
    searchParams,
    weeklyRecords,
    setSearchParams,
  ]);

  const dispatch = useDispatch();

  const [isViewChecklistQAOpen, setIsViewChecklistQAOpen] = useState<{
    open: boolean;
    id: string;
  }>({
    open: false,
    id: "",
  });
  const [isCreateChecklistQAOpen, setIsCreateChecklistQAOpen] = useState<{
    open: boolean;
    id: string;
  }>({
    open: false,
    id: "",
  });
  const [isForApprovalOpen, setIsForApprovalOpen] = useState<{
    open: boolean;
    id: string;
  }>({
    open: false,
    id: "",
  });
  const [isForSurveyApprovalOpen, setIsForSurveyApprovalOpen] = useState<{
    open: boolean;
    id: string;
  }>({
    open: false,
    id: "",
  });
  const [openViewRemarks, setOpenViewRemarks] = useState<{
    open: boolean;
    remarks: string;
  }>({
    open: false,
    remarks: "",
  });

  const handleViewApproverRemarks = (approverRemarks: string) => {
    setOpenViewRemarks({ open: true, remarks: approverRemarks });
  };

  const saveTouchedData = (data: typeof touchedData) => {
    try {
      localStorage.setItem("touchedData", JSON.stringify(data));
    } catch (err) {
      console.error("Failed to save touchedData", err);
    }
  };

  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>();
  const columns: Array<ITableColumn<Partial<StoreChecklistsType>, unknown>> = [
    {
      id: "store",
      label: "Store",
      uniqueId: "store",
      getValue: (qaItem) => qaItem.store || "",
      sortable: true,
    },

    {
      id: "grade",
      label: "Grade",
      getValue: (qaItem) => qaItem?.grade ?? "0%",
    },

    {
      id: "week",
      label: "Week",
      getValue: (qaItem) => {
        return qaItem.week;
      },
    },

    {
      id: "done_on",
      label: "Done on",
      getValue: (qaItem) => {
        return qaItem.done_on;
      },
    },
    {
      id: "status",
      label: "Status",
      getValue: () => {},
      renderCell: (value, item) => {
        const status = (() => {
          if (item.status && item.status === "Rejected") return item.status;
          else if (item.status === "Approved" && isSurveyApprover)
            return "Approved";
          else if (item.status === "Approved" && !isSurveyApprover)
            return "Pending";
          else if (item.status === "Completed") return "Done";
          else if (item.status === "For Approval") return "For Approval";
          else if (item.isOverdue) return "Overdue";
          else return "Pending";
        })();
        return (
          <StatusChip status={status ?? "Pending"} key={item.qaItemData?.id} />
        );
      },
      width: 150,
    },
    {
      id: "approver_remarks",
      label: "Approver Remarks",
      getValue: () => {},
      renderCell: (value, item) => {
        const viewRemarksButton = (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}>
            <Box
              sx={{
                ":hover": { backgroundColor: "#e5ff0077" },
                height: "21px",
                borderRadius: "100%",
              }}>
              <Eye
                color="orange"
                size={20}
                onClick={() => {
                  handleViewApproverRemarks(item.approver_remarks || "");
                }}
                weight="fill"
              />
            </Box>
          </Box>
        );

        return item.approver_remarks ? viewRemarksButton : null;
      },
      width: 150,
    },
  ];

  const startOfMonth = moment().startOf("month");
  const weekName = ["1st", "2nd", "3rd", "4th"];
  let mondayCount = 0;
  const day = startOfMonth.clone();
  const weekStore = singleWeeklyRecord?.data.store_checklist
    ?.map((checklistItem) => {
      return checklistItem.weekly_record.map((record) => {
        return record;
      });
    })
    .flat();
  const storeName = touchedData.name;
  const answeredWeeks = weekStore?.map((week) => {
    return week.week;
  });
  const weeksToAnswer: number[] = [];

  const shouldEnableWeekActions = (
    weekIndex: number,
    isSurveyApproverMode: boolean,
  ) => {
    if (!weekStore || weekStore.length === 0) return weekIndex === 0;

    for (let i = 0; i < weekIndex; i++) {
      const previousWeek = weekStore[i];
      if (!previousWeek || previousWeek.status !== "Completed") {
        return false;
      }
    }

    const currentWeek = weekStore[weekIndex];
    if (!currentWeek) return true;

    if (currentWeek.status === "For Approval") {
      return isSurveyApproverMode;
    }

    return currentWeek.status !== "Completed";
  };

  const getRightClickMenuItems = (
    qaItem: StoreChecklistsType,
  ): Array<ContextMenuItem<StoreChecklistsType>> => {
    const forApproval = currentParams.dg === "view-quality-assurance";
    const isForSurveyApprover = currentParams.dg === "view-survey-approver";

    const buttons: {
      id: string;
      label: string | JSX.Element;
      icon: JSX.Element;
      onClick: () => void;
    }[] = [];

    const showChecklist = {
      id: `show-checklist-${qaItem?.qaItemData?.id}`,
      label: "Show Checklist",
      icon: <ListBullets />,
      onClick: () => {
        setIsViewChecklistQAOpen({
          open: true,
          id: qaItem.qaItemData.id.toString(),
        });
        dispatch(
          getChecklistData({
            checklistData: {
              ...qaItem,
              month: touchedData.month,
              year: touchedData.year,
              week: qaItem.week,
            },
          }),
        );
      },
    };

    const startChecking = {
      id: `start-checklist-${qaItem?.qaItemData?.id}`,
      label: "Start Checking",
      icon: <Check />,
      onClick: () => {
        setIsCreateChecklistQAOpen({
          open: true,
          id: qaItem.qaItemData.id.toString(),
        });
        dispatch(
          getChecklistData({
            checklistData: {
              ...qaItem,
              month: touchedData.month,
              year: touchedData.year,
              week: qaItem.week,
              isViewStoreChecklist: true,
              isOverdueFillup: !qaItem.isOverdueNotAnswerable,
              status: qaItem.status,
            },
          }),
        );
      },
    };

    const forApprovalModule = {
      id: `for-approval-${qaItem?.qaItemData?.id}`,
      label: <Typography>For Approval</Typography>,
      icon: <ListChecks />,
      onClick: () => {
        setIsForApprovalOpen({
          open: true,
          id: qaItem.checklistId || qaItem.qaItemData.id.toString(),
        });
        dispatch(
          getChecklistData({
            checklistData: {
              ...qaItem,
              month: touchedData.month,
              year: touchedData.year,
              week: qaItem.week,
              singleWeeklyRecord:
                singleWeeklyRecord?.data?.store_checklist?.[0]?.weekly_record,
              isForApproving: true,
            },
          }),
        );
      },
    };

    const forSurveyApproverModule = {
      id: `for-survey-approver-${qaItem?.qaItemData?.id}`,
      label: <Typography>View</Typography>,
      icon: <MagnifyingGlass />,
      onClick: () => {
        setIsForSurveyApprovalOpen({
          open: true,
          id: qaItem.checklistId || qaItem.qaItemData.id.toString(),
        });
        dispatch(
          getChecklistData({
            checklistData: {
              ...qaItem,
              month: touchedData.month,
              year: touchedData.year,
              week: qaItem.week,
              singleWeeklyRecord:
                singleWeeklyRecord?.data?.store_checklist?.[0]?.weekly_record,
              isForApproving: true,
            },
          }),
        );
      },
    };

    const viewReportSummary = {
      id: `view-report-summary-${qaItem?.qaItemData?.id}`,
      label: <Typography>Show Report</Typography>,
      icon: <WarningCircle />,
      onClick: () => {
        setOpenReport(true);
        dispatch(
          getChecklistData({
            checklistData: {
              ...qaItem,
              month: touchedData.month,
              year: touchedData.year,
              week: qaItem.week,
              singleWeeklyRecord:
                singleWeeklyRecord?.data?.store_checklist?.[0]?.weekly_record,
              isForApproving: true,
            },
          }),
        );
      },
    };

    if (!qaItem.isActionsEnabled) {
      if (qaItem.status === "Completed") {
        buttons.push(showChecklist);
        buttons.push(viewReportSummary);
      }
      return buttons;
    }

    if (
      (qaItem.status === "Pending" ||
        (qaItem.status === "Approved" && !isSurveyApprover)) &&
      !isSurveyApprover &&
      !isForSurveyApprover
    ) {
      buttons.push(startChecking);
    }

    if (isForSurveyApprover && qaItem.status === "For Approval") {
      buttons.push(forSurveyApproverModule);
    }

    if (forApproval && qaItem.status === "Overdue") {
      buttons.push(forApprovalModule);
    }

    if (qaItem.status === "Completed") {
      buttons.push(showChecklist);
      buttons.push(viewReportSummary);
    }

    return buttons;
  };

  while (mondayCount < 4) {
    if (day.day() === 1) {
      const pendingLen = weekStore?.filter(
        (record) => record?.status == "Approved",
      ).length;

      const isOverdue =
        weekStore?.[mondayCount]?.weekly_skipped?.approved_at === null ||
        weekStore?.[mondayCount]?.weekly_skipped?.rejected_at === null;
      const isOverdueNotAnswerable =
        isOverdue &&
        (weekStore?.[mondayCount]?.weekly_skipped?.rejected_at !== null ||
          weekStore?.[mondayCount]?.weekly_skipped?.approved_at === null);

      const unansweredWeek = !weeksToAnswer.includes(mondayCount + 1);
      if (unansweredWeek && weeksToAnswer.length === 0) {
        if (weekStore?.[mondayCount]?.week != undefined)
          weeksToAnswer.push(weekStore?.[mondayCount]?.week);
      }
      let latestCompleted = 0;
      if (weekStore?.[0]?.status === "Completed") {
        const previousWeekStatus = weekStore?.[mondayCount - 1]?.status;
        if (
          unansweredWeek &&
          weeksToAnswer.length >= 1 &&
          previousWeekStatus === "Completed"
        ) {
          if (weekStore?.[mondayCount]?.week != undefined) {
            weeksToAnswer.push(weekStore?.[mondayCount]?.week);
            latestCompleted = weekStore?.[mondayCount]?.week;
          }
        } else if (
          previousWeekStatus === "Rejected" &&
          weekStore?.[latestCompleted]?.status === "Completed"
        ) {
          if (weekStore?.[mondayCount]?.week != undefined) {
            weeksToAnswer.push(weekStore?.[mondayCount]?.week);
          }
        }
      } else if (weekStore?.[0]?.status === "Rejected") {
        const previousWeekStatus = weekStore?.[mondayCount - 1]?.status;
        const nextWeekStatus = weekStore?.[mondayCount + 1]?.status;
        if (
          unansweredWeek &&
          weeksToAnswer.length >= 1 &&
          previousWeekStatus === "Completed"
        ) {
          if (weekStore?.[mondayCount]?.week != undefined) {
            weeksToAnswer.push(weekStore?.[mondayCount]?.week);
            latestCompleted = weekStore?.[mondayCount]?.week;
          }
        } else if (
          previousWeekStatus === "Rejected" &&
          nextWeekStatus === "Rejected"
        ) {
          if (weekStore?.[mondayCount]?.week != undefined) {
            weeksToAnswer.push(weekStore?.[mondayCount]?.week);
          }
        } else {
          if (weekStore?.[mondayCount]?.week != undefined) {
            weeksToAnswer.push(weekStore?.[mondayCount]?.week);
          }
        }
      }

      const isActionsEnabled = shouldEnableWeekActions(
        mondayCount,
        isSurveyApprover,
      );

      if (answeredWeeks?.includes(mondayCount + 1)) {
        QAVisits.push({
          currentMonday: mondayCount + 1,
          weeksToAnswer,
          mondayCount,
          pendingLen,
          weekNumber: weekStore?.[mondayCount]?.week,
          weekLen: weekStore?.length,
          store: storeName,
          grade: `${weekStore?.[mondayCount]?.weekly_grade ?? 0}%`,
          week: weekName[mondayCount],
          done_on: moment(weekStore?.[mondayCount]?.create_at).format(
            "MM/DD/YYYY",
          ),
          approver_remarks: weekStore?.[mondayCount]?.approver_remarks,
          status: weekStore?.[mondayCount]?.status,
          isOverdueNotAnswerable,
          qaItemData: touchedData,
          isOverdue,
          isActionsEnabled,
        });
      } else {
        QAVisits.push({
          currentMonday: mondayCount + 1,
          weeksToAnswer,
          pendingLen,
          weekLen: weekStore?.length,
          mondayCount,
          store: storeName,
          grade: "0%",
          week: weekName[mondayCount],
          done_on: "mm/dd/yyyy",
          approver_remarks: weekStore?.[mondayCount]?.approver_remarks,
          status: "Pending",
          qaItemData: touchedData,
          isOverdueNotAnswerable,
          isOverdue,
          isActionsEnabled,
        });
      }
      mondayCount++;
    }
    day.add(1, "day");
  }

  const openDialogCreate = isQAItemOpen(MODULES.QA.ALIAS);
  const openSurveyApprover =
    isSurveyApprover && isQAItemOpen(MODULES.SURVEY_APPROVER.ALIAS);

  return (
    <>
      <ResponsiveDialog
        open={openDialogCreate || openSurveyApprover}
        onClose={() => {
          closeQADialog();
        }}
        disableClickAway={false}
        maxHeight="50vh">
        <DialogTitle>Quality Visit</DialogTitle>

        <DialogContent>
          {isLoading ||
          isLoadingApprove ||
          isSingleWeeklyRecordLoading ||
          isSingleWeeklyRecordFetching ? (
            <AuroraSpinner />
          ) : (
            <MasterlistLayout showSearch={false}>
              <TableComponent<StoreChecklistsType>
                columns={columns}
                data={QAVisits || []}
                expandedRows={expandedRows ?? {}}
                onExpandedRowsChange={setExpandedRows}
                rightClickMenuItems={getRightClickMenuItems}
                actions={getRightClickMenuItems}
              />
            </MasterlistLayout>
          )}
        </DialogContent>
      </ResponsiveDialog>
      <ApproverRemarksDialog
        openViewRemarks={openViewRemarks}
        setOpenViewRemarks={setOpenViewRemarks}
      />
      <ChecklistDialog
        isCreateChecklistQAOpen={isCreateChecklistQAOpen}
        setIsCreateChecklistQAOpen={setIsCreateChecklistQAOpen}
        isViewChecklistQAOpen={isViewChecklistQAOpen}
        setIsViewChecklistQAOpen={setIsViewChecklistQAOpen}
      />
      <ForApprovalDialog
        isLoading={isLoading}
        forApprove={forApprove}
        isForApprovalOpen={isForApprovalOpen}
        setIsForApprovalOpen={setIsForApprovalOpen}
      />
      <ForSurveyApproverDialog
        isLoadingApprove={isLoadingApprove}
        approve={approve}
        isForSurveyApprovalOpen={isForSurveyApprovalOpen}
        setIsForSurveyApprovalOpen={setIsForSurveyApprovalOpen}
      />
      <SurveyReport openReport={openReport} setOpenReport={setOpenReport} />
    </>
  );
};

export default QAChecklistDialog;
