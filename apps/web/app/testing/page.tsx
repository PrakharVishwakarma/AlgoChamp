import { FlashMessageDemo } from "../../components/demo/FlashMessageDemo";
import { IconShowcase } from "../../components/demo/IconShowcase";

export default function TestingPage() {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            <h1 className="text-4xl font-bold text-white">Testing Page</h1>
            <div>
                <div>
                    <FlashMessageDemo />
                </div>
                <div>
                    <IconShowcase />
                </div>
            </div>
        </div>
    );
}