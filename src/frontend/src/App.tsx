import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { useConfirmPayment } from "./hooks/useQueries";
import { ConversationPage } from "./pages/ConversationPage";
import { CreateListingPage } from "./pages/CreateListingPage";
import { EditListingPage } from "./pages/EditListingPage";
import { HomePage } from "./pages/HomePage";
import { ListingDetailPage } from "./pages/ListingDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { MessagesPage } from "./pages/MessagesPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RegisterPage } from "./pages/RegisterPage";

function PaymentHandler() {
  const confirmPayment = useConfirmPayment();

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
    const sessionId = params.get("session_id");

    if (paymentStatus === "success" && sessionId) {
      confirmPayment
        .mutateAsync(sessionId)
        .then(() => {
          toast.success("Pago completado exitosamente", { duration: 6000 });
        })
        .catch(() => {
          toast.success("Pago recibido. Verificando estado...", {
            duration: 6000,
          });
        });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === "cancelled") {
      toast.info("Pago cancelado", { duration: 4000 });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return null;
}

// Root layout
const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster richColors position="top-right" />
      <PaymentHandler />
    </div>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const listingDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/listing/$id",
  component: ListingDetailPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

const createListingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/listings/new",
  component: CreateListingPage,
});

const editListingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/listings/$id/edit",
  component: EditListingPage,
});

const messagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/messages",
  component: MessagesPage,
});

const conversationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/messages/$userId",
  component: ConversationPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  listingDetailRoute,
  loginRoute,
  registerRoute,
  profileRoute,
  createListingRoute,
  editListingRoute,
  messagesRoute,
  conversationRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
