import HomeButton from "../ui/homeButton";
import Footer from "../Footer";

import React from "react";
import {
  MapPin,
  Users,
  TrendingUp,
  MessageCircle,
  Home,
  DollarSign,
} from "lucide-react";

function AboutBody() {
  const features = [
    {
      icon: <MapPin size={26} strokeWidth={1.5} />,
      title: "Local Expertise",
      text: "Deep knowledge of Squamish neighbourhoods, communities, and market trends.",
    },
    {
      icon: <Users size={26} strokeWidth={1.5} />,
      title: "Client First",
      text: "Every decision is guided by your goals, priorities, and unique journey.",
    },
    {
      icon: <TrendingUp size={26} strokeWidth={1.5} />,
      title: "Proven Results",
      text: "Strategic guidance backed by successful transactions and happy clients.",
    },
    {
      icon: <MessageCircle size={26} strokeWidth={1.5} />,
      title: "Clear Communication",
      text: "Transparent updates and support from start to finish.",
    },
  ];

  const stats = [
    {
      icon: <Home size={22} strokeWidth={1.5} />,
      value: "250+",
      label: "Homes Sold",
    },
    {
      icon: <DollarSign size={22} strokeWidth={1.5} />,
      value: "$150M+",
      label: "Sales Volume",
    },
    {
      icon: <Users size={22} strokeWidth={1.5} />,
      value: "500+",
      label: "Happy Clients",
    },
  ];

  return (
    <div className="px-6 py-20 relative z-20 ">
      {/* FEATURES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-24">
        {features.map((item, index) => (
          <div
            key={index}
            className="group text-center flex flex-col items-center"
          >
            <div
              className="
              h-16 w-16 mb-5 rounded-full 
              bg-white border border-slate-200
              flex items-center justify-center
              text-slate-700
              shadow-sm
              transition-all duration-300
              group-hover:-translate-y-1
              group-hover:shadow-md
              "
            >
              {item.icon}
            </div>

            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              {item.title}
            </h3>

            <p className="text-sm leading-relaxed text-slate-500 max-w-xs">
              {item.text}
            </p>
          </div>
        ))}
      </div>

      {/* BOTTOM SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* COMMITMENT CARD */}
        <div
          className="
          rounded-3xl 
          bg-[#F8F8F5]
          border border-slate-100
          p-10 lg:p-14
          shadow-sm
          flex flex-col justify-center
          "
        >
          <span className="text-sm uppercase tracking-widest text-slate-500 mb-4">
            About Us
          </span>

          <h2 className="text-4xl font-bold text-slate-900 mb-5">
            Our Commitment
          </h2>

          <div className="w-12 h-1 bg-slate-900 rounded-full mb-8"></div>

          <p className="text-slate-600 leading-relaxed max-w-lg mb-12">
            We&apos;re here to make real estate simple, transparent and
            rewarding. From your first conversation to closing day, we provide
            trusted guidance every step of the way.
          </p>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <div key={index}>
                <div
                  className="
                  h-11 w-11 rounded-full
                  border border-slate-200
                  flex items-center justify-center
                  text-slate-600
                  mb-4
                  "
                >
                  {stat.icon}
                </div>

                <div className="text-3xl font-bold text-slate-900">
                  {stat.value}
                </div>

                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* GOOGLE REVIEW CARD */}
        <div
          className="
          bg-white 
          rounded-3xl
          border border-slate-100
          shadow-xl shadow-slate-200/40
          overflow-hidden
          flex flex-col
          min-h-[620px]
          "
        >
          <div className="px-8 py-6 border-b border-slate-100">
            <h3 className="text-xl font-bold text-slate-900">
              Business Profile
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Ready to unlock valuable insights about Squamish real estate?
            </p>
          </div>

          <iframe
            src="https://widgets.sociablekit.com/google-business-profile/iframe/25698185"
            title="Google Business Profile Reviews"
            className="
            flex-1
            w-full
            min-h-[540px]
            border-0
            "
          />
        </div>
      </div>
    </div>
  );
}
export default function AboutUs() {
  return (
    // <>
    //   <Navbar />
    //   <iframe
    //     src="https://widgets.sociablekit.com/google-business-profile/iframe/25698185"
    //     width="100%"
    //     height="1000px"
    //   ></iframe>
    // </>

    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 relative">
      <HomeButton />

      {/* HEADER SECTION */}
      <div className="relative h-[45vh] w-full bg-slate-900 flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2070"
          alt="Squamish"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
            About Us
          </h1>
          <p className="text-lg text-white/80 font-medium italic">
            Find your mountian home.
          </p>
        </div>
      </div>

      <AboutBody />

      <Footer />
    </div>
  );
}
