import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';

export default () => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [tabsRef, emblaTabs] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  });
  const [panelsRef, emblaPanels] = useEmblaCarousel({
    speed: 15,
  });

  const onTabClick = useCallback(
    (index: number) => {
      if (!emblaTabs || !emblaPanels) return;
      if (emblaTabs.clickAllowed()) emblaPanels.scrollTo(index);
    },
    [emblaPanels, emblaTabs]
  );

  const onSelect = useCallback(() => {
    if (!emblaTabs || !emblaPanels) return;
    setSelectedIndex(emblaPanels.selectedScrollSnap());
    emblaTabs.scrollTo(emblaPanels.selectedScrollSnap());
  }, [emblaPanels, emblaTabs, setSelectedIndex]);

  useEffect(() => {
    if (!emblaPanels) return;
    onSelect();
    emblaPanels.on("select", onSelect);
  }, [emblaPanels, onSelect]);

  return {
    emblaTabs,
    emblaPanels,
    tabsRef,
    panelsRef,
    selectedIndex,
    onTabClick,
  };
};
