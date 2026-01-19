import Home from "@/pages/Home/Home.tsx";
import LoginPage from "@/pages/Login/Login.tsx";
import RegisterPage from "@/pages/Register/Register.tsx";
import Account from "@/pages/Account/Account.tsx";
import Saved from "@/pages/Saved/Saved.tsx";
import Followers from "@/pages/Followers/Followers.tsx";

import General from "@/pages/Settings/General";
import Team from "@/pages/Settings/Team";
import Billing from "@/pages/Settings/Billing";
import Limits from "@/pages/Settings/Limits";
import Security from "@/pages/Settings/Security";

import FAQ from "@/pages/Support/FAQ";
import ReportBug from "@/pages/Support/ReportBug";
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
                        <Route path={ROUTS.DASHBOARD} element={<div>Смолична панель</div>}/>
                        <Route path={ROUTS.PROFILE} element={<div>Профіль</div>}/>

                        <Route path={ROUTS.SETTINGS.ROOT} element={<div>Settings Page</div>}/>
                        <Route path={ROUTS.SETTINGS.GENERAL} element={<General/>}/>
                        <Route path={ROUTS.SETTINGS.TEAM} element={<Team/>}/>
                        <Route path={ROUTS.SETTINGS.BILLING} element={<Billing/>}/>
                        <Route path={ROUTS.SETTINGS.LIMITS} element={<Limits/>}/>
                        <Route path={ROUTS.SETTINGS.SECURITY} element={<Security/>}/>


                        <Route path={ROUTS.ACCOUNT} element={<Account/>}/>
                        <Route path={ROUTS.FOLLOWERS} element={<Followers/>}/>
                        <Route path={ROUTS.SAVED} element={<Saved/>}/>
                        <Route path={ROUTS.EDIT} element={<div>Edit Page</div>}/>

                        <Route path={ROUTS.SUPPORT.FAQ} element={<FAQ/>}/>
                        <Route path={ROUTS.SUPPORT.REPORT_BUG} element={<ReportBug/>}/>
                        <Route path={ROUTS.SUPPORT.ABOUT} element={<About/>}/>

                        <Route path={'*'}></Route>


                    </Route>
                </Route>
            </Routes>

            <ToastContainer autoClose={1000}/>
        </>
    );
}
