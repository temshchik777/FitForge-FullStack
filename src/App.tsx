import Home from "@/pages/Home/Home.tsx";
import LoginPage from "@/pages/Login/Login.tsx";
import RegisterPage from "@/pages/Register/Register.tsx";
import Account from "@/pages/Account/Account.tsx";
import Saved from "@/pages/Saved/Saved.tsx";
import Followers from "@/pages/Followers/Followers.tsx";

import General from "@/pages/Settings/General";
import Security from "@/pages/Settings/Security";

import FAQ from "@/pages/Support/FAQ";
import About from "@/pages/Support/About";


import {ToastContainer} from "react-toastify";
import {ROUTS} from "@/routes/routes.tsx";
import {ProtectedRoute} from "@/auth/ProtectedRoute.tsx";
import {Route, Routes} from "react-router";
import {Layout} from "@/components/Layout";


export function App() {
    return (
        <>
            <Routes>
                <Route path={ROUTS.LOGIN} element={<LoginPage/>}/>
                <Route path={ROUTS.REGISTER} element={<RegisterPage/>}/>

                <Route element={<Layout/>}>
                    <Route element={<ProtectedRoute/>}>
                        <Route path={ROUTS.HOME} element={<Home/>}/>
                        
                        <Route path={ROUTS.SETTINGS.GENERAL} element={<General/>}/>
                        <Route path={ROUTS.SETTINGS.SECURITY} element={<Security/>}/>


                        <Route path={ROUTS.ACCOUNT} element={<Account/>}/>
                        <Route path={ROUTS.FOLLOWERS} element={<Followers/>}/>
                        <Route path={ROUTS.SAVED} element={<Saved/>}/>

                        <Route path={ROUTS.SUPPORT.FAQ} element={<FAQ/>}/>
                        <Route path={ROUTS.SUPPORT.ABOUT} element={<About/>}/>

                        <Route path={'*'}></Route>


                    </Route>
                </Route>
            </Routes>

            <ToastContainer autoClose={1000}/>
        </>
    );
}
