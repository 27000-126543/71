"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Building2,
  FileCheck,
  UserCircle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Upload,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Select } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";
import { Separator } from "@/src/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/src/components/ui/alert";
import { Progress } from "@/src/components/ui/progress";
import { cn } from "@/src/lib/utils";

const step1Schema = z.object({
  name: z.string().min(2, "企业名称至少2个字符"),
  unifiedCreditCode: z.string().length(18, "统一社会信用代码必须为18位"),
  legalPerson: z.string().min(2, "法人姓名至少2个字符"),
  registeredCapital: z.coerce.number().positive("注册资本必须大于0"),
  industry: z.string().min(1, "请选择行业"),
  foundedDate: z.string().min(1, "请选择成立日期"),
  description: z.string().optional(),
});

const step2Schema = z.object({
  businessLicenseNo: z.string().min(1, "请输入营业执照编号"),
  licenseExpiryDate: z.string().min(1, "请选择营业执照有效期"),
  businessScope: z.string().min(1, "请输入经营范围"),
  registeredAddress: z.string().min(2, "请输入注册地址"),
});

const step3Schema = z.object({
  contactName: z.string().min(2, "联系人姓名至少2个字符"),
  contactPhone: z.string().regex(/^1[3-9]\d{9}$/, "请输入有效的手机号码"),
  contactEmail: z.string().email("请输入有效的邮箱地址"),
  contactPosition: z.string().min(1, "请输入联系人职位"),
  contactIdCard: z.string().regex(/^\d{17}[\dXx]$/, "请输入有效的身份证号").optional(),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

type FormData = Step1Data & Step2Data & Step3Data;

const industries = [
  "制造业",
  "批发和零售业",
  "交通运输、仓储和邮政业",
  "建筑业",
  "信息传输、软件和信息技术服务业",
  "金融业",
  "农林牧渔业",
  "电力、热力、燃气及水生产和供应业",
  "租赁和商务服务业",
  "其他",
];

const steps = [
  { id: 1, title: "企业基本信息", icon: Building2 },
  { id: 2, title: "资质信息", icon: FileCheck },
  { id: 3, title: "联系人信息", icon: UserCircle },
  { id: 4, title: "确认提交", icon: CheckCircle2 },
];

export default function CoreRegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [formData, setFormData] = React.useState<Partial<FormData>>({});
  const [licenseUploaded, setLicenseUploaded] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: formData as Step1Data,
    mode: "onBlur",
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: formData as Step2Data,
    mode: "onBlur",
  });

  const step3Form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: formData as Step3Data,
    mode: "onBlur",
  });

  const handleNextStep1 = async () => {
    const valid = await step1Form.trigger();
    if (valid) {
      setFormData({ ...formData, ...step1Form.getValues() });
      setCurrentStep(2);
    }
  };

  const handleNextStep2 = async () => {
    const valid = await step2Form.trigger();
    if (valid && licenseUploaded) {
      setFormData({ ...formData, ...step2Form.getValues() });
      setCurrentStep(3);
    }
  };

  const handleNextStep3 = async () => {
    const valid = await step3Form.trigger();
    if (valid) {
      setFormData({ ...formData, ...step3Form.getValues() });
      setCurrentStep(4);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSubmitSuccess(true);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const progress = (currentStep / steps.length) * 100;

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-800 via-navy-700 to-navy-900 noise-bg flex items-center justify-center p-4">
        <Card className="w-full max-w-lg bg-navy-700/60 backdrop-blur-xl border-gold-400/30 shadow-2xl animate-fade-in">
          <CardContent className="p-10 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-gold-300 glow-text mb-3">
              注册申请提交成功
            </h2>
            <p className="text-navy-200 mb-2">
              您的企业注册申请已成功提交
            </p>
            <p className="text-navy-300 text-sm mb-8">
              我们将在 3-5 个工作日内完成审核，请保持手机畅通
            </p>
            <div className="bg-navy-800/50 rounded-lg p-4 mb-8 border border-navy-600/50">
              <p className="text-navy-300 text-sm">申请编号</p>
              <p className="text-gold-400 font-mono text-lg mt-1">
                SCF{Date.now().toString().slice(-10)}
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-navy-200 hover:text-white">
                  返回登录
                </Button>
              </Link>
              <Button variant="gold" className="flex-1 shadow-glow">
                查看申请进度
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-800 via-navy-700 to-navy-900 noise-bg py-8 px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/login">
            <Button variant="ghost" className="text-navy-200 hover:text-white p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold glow-text">核心企业注册</h1>
            <p className="text-navy-300 text-sm">提交企业资料，开通供应链金融服务</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between mb-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-all border-2",
                        isActive
                          ? "bg-gold-400 border-gold-400 text-navy-900 shadow-glow"
                          : isCompleted
                          ? "bg-green-500 border-green-500 text-white"
                          : "bg-navy-700 border-navy-500 text-navy-300"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium whitespace-nowrap",
                        isActive ? "text-gold-400" : isCompleted ? "text-green-400" : "text-navy-300"
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 flex items-center px-2 min-w-[2rem]">
                      <div
                        className={cn(
                          "h-0.5 w-full",
                          step.id < currentStep ? "bg-green-500" : "bg-navy-600"
                        )}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <Progress value={progress} color="gold" className="h-1" />
        </div>

        <Card className="bg-navy-700/60 backdrop-blur-xl border-gold-400/30 shadow-2xl">
          <CardContent className="p-8">
            {currentStep === 1 && (
              <div className="space-y-5 animate-fade-in">
                <h2 className="text-lg font-semibold text-gold-300 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  企业基本信息
                </h2>
                <Separator className="bg-navy-600/50" />

                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2 space-y-2">
                    <Label className="text-navy-100">企业名称 <span className="text-red-400">*</span></Label>
                    <Input
                      placeholder="请输入企业全称"
                      className="bg-navy-800/50 border-navy-500/50 text-white placeholder:text-navy-300 focus-visible:ring-gold-400"
                      {...step1Form.register("name")}
                    />
                    {step1Form.formState.errors.name && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {step1Form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-navy-100">统一社会信用代码 <span className="text-red-400">*</span></Label>
                    <Input
                      placeholder="18位信用代码"
                      maxLength={18}
                      className="bg-navy-800/50 border-navy-500/50 text-white placeholder:text-navy-300 focus-visible:ring-gold-400 font-mono"
                      {...step1Form.register("unifiedCreditCode")}
                    />
                    {step1Form.formState.errors.unifiedCreditCode && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {step1Form.formState.errors.unifiedCreditCode.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-navy-100">法定代表人 <span className="text-red-400">*</span></Label>
                    <Input
                      placeholder="请输入法人姓名"
                      className="bg-navy-800/50 border-navy-500/50 text-white placeholder:text-navy-300 focus-visible:ring-gold-400"
                      {...step1Form.register("legalPerson")}
                    />
                    {step1Form.formState.errors.legalPerson && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {step1Form.formState.errors.legalPerson.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-navy-100">注册资本（万元） <span className="text-red-400">*</span></Label>
                    <Input
                      type="number"
                      placeholder="请输入注册资本"
                      className="bg-navy-800/50 border-navy-500/50 text-white placeholder:text-navy-300 focus-visible:ring-gold-400"
                      {...step1Form.register("registeredCapital")}
                    />
                    {step1Form.formState.errors.registeredCapital && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {step1Form.formState.errors.registeredCapital.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-navy-100">成立日期 <span className="text-red-400">*</span></Label>
                    <Input
                      type="date"
                      className="bg-navy-800/50 border-navy-500/50 text-white focus-visible:ring-gold-400"
                      {...step1Form.register("foundedDate")}
                    />
                    {step1Form.formState.errors.foundedDate && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {step1Form.formState.errors.foundedDate.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label className="text-navy-100">所属行业 <span className="text-red-400">*</span></Label>
                    <Select
                      className="bg-navy-800/50 border-navy-500/50 text-white focus-visible:ring-gold-400"
                      {...step1Form.register("industry")}
                    >
                      <option value="">请选择行业</option>
                      {industries.map((ind) => (
                        <option key={ind} value={ind} className="bg-navy-800">
                          {ind}
                        </option>
                      ))}
                    </Select>
                    {step1Form.formState.errors.industry && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {step1Form.formState.errors.industry.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label className="text-navy-100">企业简介</Label>
                    <Textarea
                      placeholder="请简要介绍企业业务..."
                      rows={3}
                      className="bg-navy-800/50 border-navy-500/50 text-white placeholder:text-navy-300 focus-visible:ring-gold-400"
                      {...step1Form.register("description")}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button variant="gold" onClick={handleNextStep1} className="shadow-glow">
                    下一步 <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-5 animate-fade-in">
                <h2 className="text-lg font-semibold text-gold-300 flex items-center gap-2">
                  <FileCheck className="w-5 h-5" />
                  企业资质信息
                </h2>
                <Separator className="bg-navy-600/50" />

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-navy-100">营业执照编号 <span className="text-red-400">*</span></Label>
                    <Input
                      placeholder="请输入营业执照编号"
                      className="bg-navy-800/50 border-navy-500/50 text-white placeholder:text-navy-300 focus-visible:ring-gold-400 font-mono"
                      {...step2Form.register("businessLicenseNo")}
                    />
                    {step2Form.formState.errors.businessLicenseNo && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {step2Form.formState.errors.businessLicenseNo.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-navy-100">有效期至 <span className="text-red-400">*</span></Label>
                    <Input
                      type="date"
                      className="bg-navy-800/50 border-navy-500/50 text-white focus-visible:ring-gold-400"
                      {...step2Form.register("licenseExpiryDate")}
                    />
                    {step2Form.formState.errors.licenseExpiryDate && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {step2Form.formState.errors.licenseExpiryDate.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label className="text-navy-100">注册地址 <span className="text-red-400">*</span></Label>
                    <Input
                      placeholder="请输入企业注册地址"
                      className="bg-navy-800/50 border-navy-500/50 text-white placeholder:text-navy-300 focus-visible:ring-gold-400"
                      {...step2Form.register("registeredAddress")}
                    />
                    {step2Form.formState.errors.registeredAddress && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {step2Form.formState.errors.registeredAddress.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label className="text-navy-100">经营范围 <span className="text-red-400">*</span></Label>
                    <Textarea
                      placeholder="请输入营业执照上的经营范围"
                      rows={3}
                      className="bg-navy-800/50 border-navy-500/50 text-white placeholder:text-navy-300 focus-visible:ring-gold-400"
                      {...step2Form.register("businessScope")}
                    />
                    {step2Form.formState.errors.businessScope && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {step2Form.formState.errors.businessScope.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label className="text-navy-100">营业执照照片 <span className="text-red-400">*</span></Label>
                    <div
                      onClick={() => setLicenseUploaded(true)}
                      className={cn(
                        "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all",
                        licenseUploaded
                          ? "border-green-500/50 bg-green-900/20"
                          : "border-navy-500/50 bg-navy-800/30 hover:border-gold-400/50 hover:bg-navy-800/50"
                      )}
                    >
                      {licenseUploaded ? (
                        <div>
                          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-green-400" />
                          </div>
                          <p className="text-green-400 font-medium">营业执照已上传</p>
                          <p className="text-navy-400 text-xs mt-1">business_license.jpg</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setLicenseUploaded(false);
                            }}
                            className="text-navy-300 text-sm mt-3 hover:text-gold-400 transition-colors"
                          >
                            重新上传
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-navy-700/50 flex items-center justify-center">
                            <Upload className="w-8 h-8 text-navy-300" />
                          </div>
                          <p className="text-navy-200 font-medium">点击上传营业执照</p>
                          <p className="text-navy-400 text-xs mt-1">支持 JPG、PNG 格式，大小不超过 10MB</p>
                        </div>
                      )}
                    </div>
                    {!licenseUploaded && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        请上传营业执照照片
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="ghost" onClick={handlePrev} className="text-navy-200 hover:text-white">
                    <ChevronLeft className="w-4 h-4 mr-1" /> 上一步
                  </Button>
                  <Button variant="gold" onClick={handleNextStep2} className="shadow-glow">
                    下一步 <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-5 animate-fade-in">
                <h2 className="text-lg font-semibold text-gold-300 flex items-center gap-2">
                  <UserCircle className="w-5 h-5" />
                  联系人信息
                </h2>
                <Separator className="bg-navy-600/50" />

                <Alert className="bg-gold-400/10 border-gold-400/30">
                  <AlertCircle className="w-4 h-4 text-gold-400" />
                  <AlertTitle className="text-gold-400">重要提示</AlertTitle>
                  <AlertDescription className="text-navy-200">
                    联系人将作为平台与贵企业的主要对接渠道，请确保信息准确无误
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-navy-100">联系人姓名 <span className="text-red-400">*</span></Label>
                    <Input
                      placeholder="请输入联系人姓名"
                      className="bg-navy-800/50 border-navy-500/50 text-white placeholder:text-navy-300 focus-visible:ring-gold-400"
                      {...step3Form.register("contactName")}
                    />
                    {step3Form.formState.errors.contactName && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {step3Form.formState.errors.contactName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-navy-100">联系人职位 <span className="text-red-400">*</span></Label>
                    <Input
                      placeholder="如：财务总监"
                      className="bg-navy-800/50 border-navy-500/50 text-white placeholder:text-navy-300 focus-visible:ring-gold-400"
                      {...step3Form.register("contactPosition")}
                    />
                    {step3Form.formState.errors.contactPosition && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {step3Form.formState.errors.contactPosition.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-navy-100">手机号码 <span className="text-red-400">*</span></Label>
                    <Input
                      placeholder="请输入11位手机号"
                      maxLength={11}
                      className="bg-navy-800/50 border-navy-500/50 text-white placeholder:text-navy-300 focus-visible:ring-gold-400 font-mono"
                      {...step3Form.register("contactPhone")}
                    />
                    {step3Form.formState.errors.contactPhone && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {step3Form.formState.errors.contactPhone.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-navy-100">电子邮箱 <span className="text-red-400">*</span></Label>
                    <Input
                      type="email"
                      placeholder="请输入电子邮箱"
                      className="bg-navy-800/50 border-navy-500/50 text-white placeholder:text-navy-300 focus-visible:ring-gold-400"
                      {...step3Form.register("contactEmail")}
                    />
                    {step3Form.formState.errors.contactEmail && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {step3Form.formState.errors.contactEmail.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label className="text-navy-100">身份证号（选填）</Label>
                    <Input
                      placeholder="请输入18位身份证号"
                      maxLength={18}
                      className="bg-navy-800/50 border-navy-500/50 text-white placeholder:text-navy-300 focus-visible:ring-gold-400 font-mono"
                      {...step3Form.register("contactIdCard")}
                    />
                    {step3Form.formState.errors.contactIdCard && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {step3Form.formState.errors.contactIdCard.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="ghost" onClick={handlePrev} className="text-navy-200 hover:text-white">
                    <ChevronLeft className="w-4 h-4 mr-1" /> 上一步
                  </Button>
                  <Button variant="gold" onClick={handleNextStep3} className="shadow-glow">
                    下一步 <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-lg font-semibold text-gold-300 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  确认注册信息
                </h2>
                <Separator className="bg-navy-600/50" />

                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-medium text-gold-400 mb-3 flex items-center gap-2">
                      <Building2 className="w-4 h-4" /> 企业基本信息
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex">
                        <span className="text-navy-400 w-28 flex-shrink-0">企业名称</span>
                        <span className="text-white">{formData.name || "-"}</span>
                      </div>
                      <div className="flex">
                        <span className="text-navy-400 w-28 flex-shrink-0">统一社会信用代码</span>
                        <span className="text-white font-mono">{formData.unifiedCreditCode || "-"}</span>
                      </div>
                      <div className="flex">
                        <span className="text-navy-400 w-28 flex-shrink-0">法定代表人</span>
                        <span className="text-white">{formData.legalPerson || "-"}</span>
                      </div>
                      <div className="flex">
                        <span className="text-navy-400 w-28 flex-shrink-0">注册资本</span>
                        <span className="text-white">{formData.registeredCapital ? `${formData.registeredCapital} 万元` : "-"}</span>
                      </div>
                      <div className="flex">
                        <span className="text-navy-400 w-28 flex-shrink-0">所属行业</span>
                        <span className="text-white">{formData.industry || "-"}</span>
                      </div>
                      <div className="flex">
                        <span className="text-navy-400 w-28 flex-shrink-0">成立日期</span>
                        <span className="text-white">{formData.foundedDate || "-"}</span>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-navy-600/50" />

                  <div>
                    <h3 className="text-sm font-medium text-gold-400 mb-3 flex items-center gap-2">
                      <FileCheck className="w-4 h-4" /> 资质信息
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex">
                        <span className="text-navy-400 w-28 flex-shrink-0">营业执照编号</span>
                        <span className="text-white font-mono">{formData.businessLicenseNo || "-"}</span>
                      </div>
                      <div className="flex">
                        <span className="text-navy-400 w-28 flex-shrink-0">有效期至</span>
                        <span className="text-white">{formData.licenseExpiryDate || "-"}</span>
                      </div>
                      <div className="flex col-span-2">
                        <span className="text-navy-400 w-28 flex-shrink-0">注册地址</span>
                        <span className="text-white">{formData.registeredAddress || "-"}</span>
                      </div>
                      <div className="flex">
                        <span className="text-navy-400 w-28 flex-shrink-0">营业执照</span>
                        <span className="text-green-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> 已上传
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-navy-600/50" />

                  <div>
                    <h3 className="text-sm font-medium text-gold-400 mb-3 flex items-center gap-2">
                      <UserCircle className="w-4 h-4" /> 联系人信息
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex">
                        <span className="text-navy-400 w-28 flex-shrink-0">联系人</span>
                        <span className="text-white">{formData.contactName || "-"}</span>
                      </div>
                      <div className="flex">
                        <span className="text-navy-400 w-28 flex-shrink-0">职位</span>
                        <span className="text-white">{formData.contactPosition || "-"}</span>
                      </div>
                      <div className="flex">
                        <span className="text-navy-400 w-28 flex-shrink-0">手机号码</span>
                        <span className="text-white font-mono">{formData.contactPhone || "-"}</span>
                      </div>
                      <div className="flex">
                        <span className="text-navy-400 w-28 flex-shrink-0">电子邮箱</span>
                        <span className="text-white">{formData.contactEmail || "-"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert className="bg-navy-800/50 border-navy-500/50">
                  <AlertCircle className="w-4 h-4" />
                  <AlertTitle>服务条款</AlertTitle>
                  <AlertDescription className="text-navy-200 text-sm">
                    点击提交即表示您已阅读并同意《盛融供应链金融平台服务协议》和《隐私政策》
                  </AlertDescription>
                </Alert>

                <div className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={handlePrev} className="text-navy-200 hover:text-white">
                    <ChevronLeft className="w-4 h-4 mr-1" /> 上一步
                  </Button>
                  <Button
                    variant="gold"
                    size="lg"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="shadow-glow"
                  >
                    {isSubmitting ? "提交中..." : "确认提交注册"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
