interface Testimonial {
  stars: string;
  quote: string;
  initials: string;
  name: string;
  store: string;
  avatarColor: "bg-accent" | "bg-green" | "bg-orange";
}

export const testimonials: Testimonial[] = [
  {
    stars: "★★★★★",
    quote:
      "আমাদের প্রতিদিন ৩০০+ অর্ডার আসে। Steadfast আর Pathao manually চেক করা অনেক সময় নষ্ট করতো। ConversionFlow সব auto করে দিচ্ছে।",
    initials: "RA",
    name: "Rahim Ahmed",
    store: "StyleBD.com · Dhaka",
    avatarColor: "bg-accent",
  },
  {
    stars: "★★★★★",
    quote:
      "The Fraud Shield alone saved us ৳25,000 last month. Blacklisted a repeat scammer's number — haven't seen a fake order since.",
    initials: "TH",
    name: "Tanvir Hossain",
    store: "TechGear.com.bd · Chittagong",
    avatarColor: "bg-green",
  },
  {
    stars: "★★★★★",
    quote:
      "Meta CAPI changed our ad results completely. ROAS improved 40% — the algorithm finally had proper delivery and return data.",
    initials: "SK",
    name: "Sumaiya Khan",
    store: "HomeDecorBD · Sylhet",
    avatarColor: "bg-orange",
  },
];
