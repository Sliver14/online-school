/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#34009B",
                secondary: "#FF9900",
                info: "#17a2b8",
                success: "#28a745",
                warning: "#ffc107",
                error: "#dc3545",
                darkgray: "#212529",
                mediumgray: "#495057",
                textgray: "#6c757d",
                lightgray: "#adb5bd",
                bordergray: "#e9ecef",
                backgroundgray: "#f8f9fa",
            },
            fontFamily: {
                inter: ["Inter", "sans-serif"],
            },
            fontSize: {
                // Desktop
                desktop_h1: ["168px", { lineHeight: "182px", fontWeight: "700" }],
                desktop_h2: ["119px", { lineHeight: "129px", letterSpacing: "-0.02em", fontWeight: "700" }],
                desktop_h3: ["84px", { lineHeight: "90px", letterSpacing: "-0.02em", fontWeight: "700" }],
                desktop_h3_light: ["84px", { lineHeight: "90px", letterSpacing: "-0.02em", fontWeight: "300" }],
                desktop_h4: ["60px", { lineHeight: "60px", letterSpacing: "-0.02em", fontWeight: "700" }],
                desktop_h5: ["42px", { lineHeight: "50px", letterSpacing: "-0.02em", fontWeight: "700" }],
                desktop_h6: ["30px", { lineHeight: "35px", letterSpacing: "-0.02em", fontWeight: "700" }],
                desktop_paragraph: ["21px", { lineHeight: "30px", letterSpacing: "-0.02em", fontWeight: "400" }],
                desktop_paragraph_bold: ["21px", { lineHeight: "1.75", letterSpacing: "-0.02em", fontWeight: "700" }],
                desktop_small: ["15px", { lineHeight: "16px", letterSpacing: "-0.02em", fontWeight: "400" }],
                desktop_small_bold: ["15px", { lineHeight: "16px", letterSpacing: "-0.02em", fontWeight: "700" }],

                // Tablet
                tablet_h1: ["144px", { lineHeight: "145px", letterSpacing: "-0.02em", fontWeight: "700" }],
                tablet_h2: ["102px", { lineHeight: "105px", letterSpacing: "-0.02em", fontWeight: "700" }],
                tablet_h3: ["72px", { lineHeight: "83px", letterSpacing: "-0.02em", fontWeight: "700" }],
                tablet_h3_light: ["72px", { lineHeight: "83px", letterSpacing: "-0.02em", fontWeight: "300" }],
                tablet_h4: ["51px", { lineHeight: "60px", letterSpacing: "-0.02em", fontWeight: "700" }],
                tablet_h5: ["36px", { lineHeight: "45px", letterSpacing: "-0.02em", fontWeight: "700" }],
                tablet_h6: ["26px", { lineHeight: "33px", letterSpacing: "-0.02em", fontWeight: "700" }],
                tablet_paragraph: ["18px", { lineHeight: "28px", letterSpacing: "-0.02em", fontWeight: "400" }],
                tablet_paragraph_bold: ["18px", { lineHeight: "28px", letterSpacing: "-0.02em", fontWeight: "700" }],
                tablet_small: ["13px", { lineHeight: "15px", letterSpacing: "-0.02em", fontWeight: "700" }],
                tablet_small_bold: ["13px", { lineHeight: "15px", letterSpacing: "-0.02em", fontWeight: "400" }],

                // Mobile
                mobile_h1: ["69px", { lineHeight: "68px", letterSpacing: "-0.02em", fontWeight: "700" }],
                mobile_h2: ["55px", { lineHeight: "55px", letterSpacing: "-0.02em", fontWeight: "700" }],
                mobile_h3: ["44px", { lineHeight: "44px", letterSpacing: "-0.02em", fontWeight: "300" }],
                mobile_h3_bold: ["44px", { lineHeight: "44px", letterSpacing: "-0.02em", fontWeight: "700" }],
                mobile_h4: ["36px", { lineHeight: "36px", letterSpacing: "-0.02em", fontWeight: "700" }],
                mobile_h5: ["28px", { lineHeight: "27px", letterSpacing: "-0.02em", fontWeight: "700" }],
                mobile_h6: ["22.5px", { lineHeight: "22px", letterSpacing: "-0.02em", fontWeight: "700" }],
                mobile_paragraph: ["18px", { lineHeight: "24px", letterSpacing: "-0.02em", fontWeight: "400" }],
                mobile_paragraph_bold: ["18px", { lineHeight: "24px", letterSpacing: "-0.02em", fontWeight: "700" }],
                mobile_small: ["14.5px", { lineHeight: "15px", letterSpacing: "-0.02em", fontWeight: "700" }],
                mobile_small_bold: ["14.5px", { lineHeight: "15px", letterSpacing: "-0.02em", fontWeight: "700" }],
            },
            screens: {
                sm: "640px",
                md: "768px",
                lg: "1024px",
                xl: "1280px",
            },
        },
    },
    plugins: [],
    darkMode: "class",
};