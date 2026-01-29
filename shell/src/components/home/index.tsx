import { useMemo } from "react";
import { useShowcaseSettings } from "./hooks/useShowcaseSettings";
import { useAngularWidgetMessage } from "./hooks/useAngularWidgetMessage";
import { getDensityStyles, getMotionTransition } from "./utils/densityMotion";
import { ShellHeader } from "./components/ShellHeader";
import { ShowcaseSection } from "./components/ShowcaseSection";
import { AngularWidgetSection } from "./components/AngularWidgetSection";

export function HomePage() {
  const { lastMessage, settings } = useShowcaseSettings();
  const angularWidgetMessage = useAngularWidgetMessage();

  const densityStyles = useMemo(
    () => getDensityStyles(settings?.density),
    [settings?.density],
  );
  const motionTransition = useMemo(
    () => getMotionTransition(settings?.motion),
    [settings?.motion],
  );

  return (
    <>
      <ShellHeader
        densityStyles={densityStyles}
        motionTransition={motionTransition}
      />
      <ShowcaseSection
        lastMessage={lastMessage}
        settings={settings}
        densityStyles={densityStyles}
        motionTransition={motionTransition}
      />
      <AngularWidgetSection
        message={angularWidgetMessage}
        densityStyles={densityStyles}
        motionTransition={motionTransition}
      />
    </>
  );
}
