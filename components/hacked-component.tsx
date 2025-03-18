"use client";

import { fetchFromAPI } from "@/app/extras/actions";

export default function HackedComponent({ data }: any) {
  fetchFromAPI();
  return <div>hacked</div>;
}
