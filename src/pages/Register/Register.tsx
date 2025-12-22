import { RegisterForm } from "@/components/RegisterForm.tsx";
import {MainBackgroundImage} from "@/AppBackgroundImage/AppBackgroundImage.tsx";

const RegisterPage = () => {
    return (
        <div className="relative min-h-svh w-full overflow-hidden">
            <MainBackgroundImage className="absolute inset-0 -z-10" />

            <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-sm">
                    <RegisterForm />
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
