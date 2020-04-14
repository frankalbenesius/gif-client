import mixpanel, { Dict } from "mixpanel-browser";

const MIXPANEL_TOKEN = process.env.REACT_APP_MIXPANEL_TOKEN;

if (MIXPANEL_TOKEN) {
  mixpanel.init(MIXPANEL_TOKEN);
}

export function track(event: string, properties?: Dict): void {
  if (MIXPANEL_TOKEN) {
    mixpanel.track(event, properties);
  }
}
