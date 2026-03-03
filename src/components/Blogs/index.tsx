import { Home as HomeIcon, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Blogs() {
    return (
       <section 
        id="neighborhoods"
        className="relative py-20 bg-primary text-primary-foreground overflow-hidden"
        style={{
          clipPath: "polygon(0 0, 100% 8%, 100% 92%, 0 100%)",
          marginTop: "-3rem",
          marginBottom: "-3rem",
          paddingTop: "6rem",
          paddingBottom: "6rem",
        }}
      >
        {/* Topographic Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(https://private-us-east-1.manuscdn.com/sessionFile/s28JNvt7FNbqBDcvkeiXw5/sandbox/5xyNfUtj2D8ALW69YKw8jb_1770580502521_na1fn_dG9wb2dyYXBoaWMtcGF0dGVybg.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvczI4Sk52dDdGTmJxQkRjdmtlaVh3NS9zYW5kYm94LzV4eU5mVXRqMkQ4QUxXNjlZS3c4amJfMTc3MDU4MDUwMjUyMV9uYTFmbl9kRzl3YjJkeVlYQm9hV010Y0dGMGRHVnliZy5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=OAWhwFKD-PZvp~QO9bJWPashZwaOywxorh9DweLfTsSJCGJgjELPYseqKaxc3hfZc5sSP88WgzrhcO~ROw28ndG~mtBjiODm7TptnheLimwi67DPobgC8tO2YgofxvZ56P6rxg60tFgbZ5~2Aqsw9w~DzH9QtKb4JecwztczyRWrlyYz8ONi1L3d8NJ45e2MtRgmbThWS4fOUk9TAmMPCTxeRAyc38xEnBIRGkAk8iAJzgT0CmoPxCWrvASiWVb5EYIK0E~GTrUpG5tyymBa0zmrpxxzwLgqE5hU78QzM5hKI4VkSFnju-0bgGTf3n65SD~MftIaGKhoGIig0hLrcg__)`,
            backgroundSize: "400px 400px",
            backgroundRepeat: "repeat",
          }}
        />
        
        <div className="container relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Explore Our Squamish Blog
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto mb-4">
                <HomeIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Outdoor Paradise</h3>
              <p className="text-primary-foreground/80">
                World-class rock climbing, mountain biking, and hiking right at your doorstep
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Growing Community</h3>
              <p className="text-primary-foreground/80">
                Thriving local economy with strong real estate appreciation and development
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Vibrant Lifestyle</h3>
              <p className="text-primary-foreground/80">
                Close-knit community with excellent schools, dining, and cultural events
              </p>
            </div>
          </div>
          <div className="text-center mt-12">
          <Button variant="outline">
              View All
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
        </div>
        </div>
      </section>
    );
}