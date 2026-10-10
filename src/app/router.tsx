import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { Skeleton } from "../components/ui/Skeleton";

const LandingPage = lazy(() => import("../pages/Landing/LandingPage"));
const DashboardPage = lazy(() => import("../pages/Dashboard/DashboardPage"));
const IntakePage = lazy(() => import("../pages/Intake/IntakePage"));
const DocumentsPage = lazy(() => import("../pages/Documents/DocumentsPage"));
const GuidancePage = lazy(() => import("../pages/Guidance/GuidancePage"));
const StatusPage = lazy(() => import("../pages/Status/StatusPage"));
const ApplicationsPage = lazy(() => import("../pages/Applications/ApplicationsPage"));
const SettingsPage = lazy(() => import("../pages/Settings/SettingsPage"));
const NotFoundPage = lazy(() => import("../pages/NotFound/NotFoundPage"));

function PageLoader() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 w-full" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Landing */}
          <Route path="/" element={<LandingPage />} />

          {/* App Layout for core authenticated/workspace pages */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/intake" element={<IntakePage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/guidance" element={<GuidancePage />} />
            <Route path="/status" element={<StatusPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback 404 */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
