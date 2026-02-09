import { Outlet, RouteObject } from "react-router";
import { CONFIG } from "../config/config";
import General from "../pages/(settings)/general/page";
import ErrorPage from "../pages/error/page";
import Info from "../pages/info/info";
import LoginPage from "../pages/login/page";
import NotFound from "../pages/not-found/page";
import UnauthorizedPage from "../pages/unauthorized/page";
import { ProtectedRoute } from "./protected-route";
import { PublicRoute } from "./public-route";
import OneCharging from "../pages/(masterlist)/one-charging/page";
import Roles from "../pages/(masterlist)/roles/page";
import Users from "../pages/(masterlist)/users/page";
import Dashboard from "../pages/dashboard/page";
import Checklists from "../pages/(masterlist)/checklists/page";
import Store from "../pages/(masterlist)/store/page";
import Regions from "../pages/(masterlist)/regions/page";
import Areas from "../pages/(masterlist)/areas/page";
import ScoreRatings from "../pages/(masterlist)/score-rating/page";
import QADashboard from "../pages/qa-dashboard/page";
import StoreChecklist from "../pages/(masterlist)/store-checklist/page";
import RegionHead from "../pages/region-head/page";
import AreaHead from "../pages/area-head/page";
import SurveyApprover from "../pages/survey-approver/page";
import Grading from "../pages/(masterlist)/grading/page";

export const ROUTES: RouteObject[] = [
  {
    path: "*",
    element: <NotFound />,
  },
  {
    path: CONFIG.ROUTES.INFO.PATH,
    element: <Info />,
    errorElement: <ErrorPage />,
  },
  {
    path: CONFIG.ROUTES.LOGIN.PATH,
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/unauthorized",
    element: <UnauthorizedPage />,
  },

  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Outlet />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        path: CONFIG.ROUTES.INFO.PATH,
        element: <Info />,
        errorElement: <ErrorPage />,
      },
      { path: CONFIG.ROUTES.DASHBOARD.PATH, element: <Dashboard /> },
      { path: CONFIG.ROUTES.ONE_CHARGING.PATH, element: <OneCharging /> },
      { path: CONFIG.ROUTES.USERS.PATH, element: <Users /> },
      { path: CONFIG.ROUTES.ROLES.PATH, element: <Roles /> },
      { path: CONFIG.ROUTES.REGION.PATH, element: <Regions /> },
      { path: CONFIG.ROUTES.AREA.PATH, element: <Areas /> },
      { path: CONFIG.ROUTES.SCORE_RATING.PATH, element: <ScoreRatings /> },
      { path: CONFIG.ROUTES.CHECKLIST.PATH, element: <Checklists /> },
      { path: CONFIG.ROUTES.REGION_HEAD.PATH, element: <RegionHead /> },
      { path: CONFIG.ROUTES.AREA_HEAD.PATH, element: <AreaHead /> },
      { path: CONFIG.ROUTES.GRADING.PATH, element: <Grading /> },
      {
        path: CONFIG.ROUTES.STORE_CHECKLIST.PATH,
        element: <StoreChecklist />,
      },
      {
        path: CONFIG.ROUTES.STORE.PATH,
        element: <Store />,
      },
      { path: CONFIG.ROUTES.QA.PATH, element: <QADashboard /> },
      { path: CONFIG.ROUTES.SURVEY_APPROVER.PATH, element: <SurveyApprover /> },
      { path: CONFIG.ROUTES.GENERAL.PATH, element: <General /> },
    ],
  },
];
