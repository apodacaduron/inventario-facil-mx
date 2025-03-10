import { onMounted, watch } from "vue";

import { useOrganizationStore } from "@/stores";

export function useAdsense() {
  const organizationStore = useOrganizationStore();

  const loadAdSense = () => {
    if (document.getElementById("adsense-script")) return; // Prevent duplicate loading

    const script = document.createElement("script");
    script.src =
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8254295768324190";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.id = "adsense-script";
    document.head.appendChild(script);
  };

  const removeAdSense = () => {
    const script = document.getElementById("adsense-script");
    if (script) script.remove();

    // Remove injected Auto Ads elements
    document
      .querySelectorAll("iframe, .adsbygoogle")
      .forEach((ad) => ad.remove());
  };

  // Handle script loading/removal based on premium status
  onMounted(() => {
    if (!organizationStore.isPremium) {
      loadAdSense();
    } else {
      removeAdSense();
    }
  });

  // Watch for changes in premium status
  watch(
    () => organizationStore.isPremium,
    (isPremium) => {
      if (isPremium) {
        removeAdSense();
      } else {
        loadAdSense();
      }
    }
  );
}
