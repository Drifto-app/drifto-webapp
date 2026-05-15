"use client"

import React from 'react';
import { toast } from 'sonner';
import {FaCheckCircle} from "react-icons/fa";
import {MdOutlineError} from "react-icons/md";
import {IoIosInformationCircleOutline} from "react-icons/io";

type ToastType = "success" | "error" | "info";


export const showTopToast = (type: ToastType, text: string) => {
    const config = {
        icon: type === "error" ? <MdOutlineError size={20} className="text-red-600" /> :  type === "info" ? <IoIosInformationCircleOutline size={20} className="text-blue-800" /> : <FaCheckCircle size={20} className="text-green-600" />,
        style: {
            background: 'var(--popover)',
            color: 'var(--popover-foreground)',
            border: type === "error" ? '1px solid #dc2626' : type === "info" ?  '1px solid #3b82f6 ' : '1px solid #16a34a',
            padding: '16px',
            gap: '8px',
        },
    };
    toast(text, config);
};
