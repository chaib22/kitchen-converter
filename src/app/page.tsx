"use client";

import { motion } from "framer-motion";
import { AppHeader, DesktopNav, MobileBottomNav } from "@/components/converter/app-shell";
import { IngredientConverter } from "@/components/converter/ingredient-converter";
import { OvenConverter } from "@/components/converter/oven-converter";
import { VolumeConverter } from "@/components/converter/volume-converter";
import { RecipeConverter } from "@/components/converter/recipe-converter";
import { FavoritesPanel } from "@/components/converter/favorites-panel";
import { InstallPrompt } from "@/components/install-prompt";
import { useAppStore, useFavoritesLoader } from "@/lib/store";
import { useT } from "@/lib/i18n";

function ActivePanel() {
  const activeTab = useAppStore((s) => s.activeTab);

  return (
    <motion.div
      key={activeTab}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      {activeTab === "ingredients" && <IngredientConverter />}
      {activeTab === "oven" && <OvenConverter />}
      {activeTab === "volume" && <VolumeConverter />}
      {activeTab === "recipe" && <RecipeConverter />}
      {activeTab === "favorites" && <FavoritesPanel />}
    </motion.div>
  );
}

export default function Home() {
  useFavoritesLoader();
  const t = useT();

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <DesktopNav />
      <main className="order-3 mx-auto w-full max-w-2xl flex-1 px-4 pb-28 pt-4 md:pb-10">
        <ActivePanel />
      </main>
      <footer className="order-4 mt-auto hidden border-t border-border/70 py-4 text-center text-xs text-muted-foreground md:block">
        {t("footer.text")}
      </footer>
      <MobileBottomNav />
      <InstallPrompt />
    </div>
  );
}
