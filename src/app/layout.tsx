import "./globals.css";
import ReduxProvider from "./ReduxProvider";
import { ToastContainer } from "react-toastify";
import { NavigationLoaderProvider } from "@/context/NavigationLoaderContext";
import NavLoaderOverlay from "./NavLoaderOverlay";
import ClientLayoutWrapper from "./ClientLayoutWrapper";

export const metadata = {
    title: "SCREENTAB CHAT",
    icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <ReduxProvider>
                    <NavigationLoaderProvider>
                        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
                        <NavLoaderOverlay />
                    </NavigationLoaderProvider>
                    <ToastContainer />
                </ReduxProvider>
            </body>
        </html>
    );
}
