import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";

const MobileNav = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <nav className="flex flex-col space-y-4 mt-4">
          <Link to="/about" onClick={() => setOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">عن يزن</Button>
          </Link>
          <Link to="/articles" onClick={() => setOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">المقالات</Button>
          </Link>
          <Link to="/company-journeys" onClick={() => setOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">رحلات الشركات</Button>
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;