import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils.ts";
import Avatar from "./avatar";
const groupVariants = cva("inline-flex justify-start items-center", {
  variants: {}});

interface GroupDataProps {
  members: { url: string; name: string }[];
}
interface GroupViewProps extends VariantProps<typeof groupVariants> {
//   className?: string;
}

interface GroupProps extends GroupDataProps, GroupViewProps {}


export default function Group({ members }: GroupProps) {
  return (
    <div
                className={cn(
                    groupVariants(),
      )}
    >
     <ul></ul>
       {members.map((member, index) => (
         <li key={index}>
           <Avatar url={member.url} name={member.name} />
         </li>
       ))}
     
    </div>
  );
}