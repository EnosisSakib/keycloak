"use client";
import useAuth from "./useAuth";
import { useEffect } from "react";

export default function Home() {
  const auth = useAuth();

  useEffect(() => {
    if (auth.isLogin && auth.token) callApi();
  }, [auth]);

  const callApi = async () => {
    try {
      const response = await fetch("http://localhost:3000", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("failed to fetch data");
      }

      const data = await response.json();
      console.log(data);
    } catch (e) {
      console.error(e);
    }

    if (!auth.isLogin || !auth.token) return;
    try {
      const response = await fetch("http://localhost:3000/users", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${auth.token}`,
          // "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("failed to fetch data");
      }

      const data = await response.json();
      console.log(data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {auth.isLogin ? (
        <div>
          <div>Protected</div>
          <button onClick={auth.logout}>Logout</button>
        </div>
      ) : (
        <div>Public</div>
      )}
    </>
  );
}
