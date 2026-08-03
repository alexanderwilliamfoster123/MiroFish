import { motion } from "framer-motion";
import { CSSProperties, ReactNode } from "react";

interface FadeUpProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}

const FadeUp = ({ children, delay = 0, className, style }: FadeUpProps) => (
  <motion.div
    className={className}
    style={style}
    initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.7, delay, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

export default FadeUp;
