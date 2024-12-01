"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Loader, Sparkles, Mic, Image as ImageIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import GeneratePodcast from "@/components/shared/GeneratePodcast";
import GenerateThumbnail from "@/components/shared/GenerateThumbnail";
import type { Id } from "@/convex/_generated/dataModel";
import { Progress } from "@/components/ui/progress";

const voiceCategories = ["alloy", "shimmer", "nova", "echo", "fable", "onyx"];

const formSchema = z.object({
  podcastTitle: z.string().min(2, "Title must be at least 2 characters"),
  podcastDescription: z.string().min(2, "Description must be at least 2 characters"),
});

type Step = 0 | 1 | 2;

const STEPS = {
  DETAILS: 0 as Step,
  SCRIPT: 1 as Step,
  THUMBNAIL: 2 as Step,
};

const STEP_CONFIG = {
  [STEPS.DETAILS]: {
    title: "Podcast Details",
    icon: Mic,
    requiredFields: ["Title", "Voice", "Description"]
  },
  [STEPS.SCRIPT]: {
    title: "Create Script",
    icon: Sparkles,
    requiredFields: ["Script Generation"]
  },
  [STEPS.THUMBNAIL]: {
    title: "Add Thumbnail",
    icon: ImageIcon,
    requiredFields: ["Thumbnail Generation"]
  }
} as const;

const GENERATION_STAGES = {
  QUEUE: {
    label: "Preparing request",
    progress: 15
  },
  CONNECTING: {
    label: "Generating content with AI",
    progress: 45
  },
  PROCESSING: {
    label: "Processing and optimizing",
    progress: 75
  },
  UPLOADING: {
    label: "Uploading and finalizing",
    progress: 90
  }
};

const GenerationProgress = ({ stage }: { stage: string }) => {
  const [progress, setProgress] = useState(0);
  const currentStage = GENERATION_STAGES[stage as keyof typeof GENERATION_STAGES];

  useEffect(() => {
    // Reset progress when stage changes
    setProgress(0);
    
    // Animate to target progress
    const targetProgress = currentStage?.progress || 0;
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 0.5;
        if (next >= targetProgress) {
          clearInterval(interval);
          return targetProgress;
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [currentStage]);

  return (
    <div className="mt-4 p-4 bg-black-1/30 rounded-xl border border-[--accent-color]/20">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-white-1 font-medium">{currentStage?.label}</span>
          <div className="flex gap-1">
            <span className="animate-bounce">.</span>
            <span className="animate-bounce delay-100">.</span>
            <span className="animate-bounce delay-200">.</span>
          </div>
        </div>
        <span className="text-white-2 text-sm">{Math.round(progress)}%</span>
      </div>
      <Progress 
        value={progress}
        className="h-2 bg-black-4"
      />
    </div>
  );
};

const RequiredFieldsAlert = ({ fields }: { fields: string[] }) => (
  <div className="mt-2 flex items-start gap-2 text-amber-400/80 text-sm">
    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
    <div>
      <p>Please complete the following:</p>
      <ul className="list-disc list-inside mt-1">
        {fields.map(field => (
          <li key={field}>{field}</li>
        ))}
      </ul>
    </div>
  </div>
);

export default function CreatePodcast() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(STEPS.DETAILS);
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageStorageId, setImageStorageId] = useState<Id<"_storage"> | null>(null);
  const [imageUrl, setImageUrl] = useState("");

  const [audioUrl, setAudioUrl] = useState("");
  const [audioStorageId, setAudioStorageId] = useState<Id<"_storage"> | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);

  const [voiceType, setVoiceType] = useState<string | null>(null);
  const [voicePrompt, setVoicePrompt] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRequiredFields, setShowRequiredFields] = useState(false);
  const [generationStage, setGenerationStage] = useState<string | null>(null);

  const createPodcast = useMutation(api.podcasts.createPodcast);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      podcastTitle: "",
      podcastDescription: "",
    },
  });

  const { watch } = form;
  const title = watch("podcastTitle");
  const description = watch("podcastDescription");

  const canProceedToScript = title && description && voiceType;
  const canGenerateAudio = voicePrompt;
  const canGenerateThumbnail = audioUrl;
  const canSubmit = imageUrl && audioUrl;

  useEffect(() => {
    if (!voiceType) {
      setVoiceType("alloy");
    }
  }, [voiceType]);

  const handleNext = () => {
    if (currentStep === STEPS.DETAILS && !canProceedToScript) {
      setShowRequiredFields(true);
      form.trigger(["podcastTitle", "podcastDescription"]);
      return;
    }
    if (currentStep === STEPS.SCRIPT && !audioUrl) {
      setShowRequiredFields(true);
      return;
    }
    setShowRequiredFields(false);
    const nextStep = (currentStep + 1) as Step;
    setCurrentStep(nextStep);
  };

  const handleBack = () => {
    const prevStep = (currentStep - 1) as Step;
    setCurrentStep(prevStep);
  };

  const handleSetAudioStorageId = (id: string) => {
    setAudioStorageId(id as Id<"_storage">);
  };

  const handleSetImageStorageId = (id: string) => {
    setImageStorageId(id as Id<"_storage">);
  };

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);

      if (!audioUrl || !imageUrl || !voiceType || !audioStorageId || !imageStorageId) {
        toast.error("Please complete all steps before publishing");
        return;
      }

      const podcastId = await createPodcast({
        podcastTitle: data.podcastTitle,
        podcastDescription: data.podcastDescription,
        audioUrl,
        imageUrl,
        voiceType,
        imagePrompt,
        voicePrompt,
        views: 0,
        audioDuration,
        audioStorageId,
        imageStorageId,
        author: "Anonymous",
      });
      console.log("THUIS IS THE PODCAST ID");

      console.log(podcastId);

      if (podcastId) {
        toast.success("Podcast created successfully!");
        router.push(`/podcasts/${podcastId}`);
      } else {
        throw new Error("Failed to create podcast");
      }
    } catch (error) {
      console.error("Error creating podcast:", error);
      toast.error("Failed to create podcast. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="w-full max-w-6xl mx-auto pt-8">
        {/* Page Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[--accent-color] to-purple-500 mb-3">
            Create Your Podcast
          </h1>
          <p className="text-gray-400 text-lg mb-12">
            Transform your ideas into an engaging podcast with AI assistance
          </p>
        </div>

        {/* Main Content Area */}
        <div className="bg-black-2/40 backdrop-blur-xl rounded-2xl border border-black-4/50 shadow-2xl overflow-hidden">
          {/* Steps Header */}
          <div className="p-8 pb-0">
            <div className="flex justify-between relative">
              {/* Progress Line */}
              <div className="absolute top-6 left-0 w-full h-0.5 bg-gradient-to-r from-black-4 to-black-3">
                <div 
                  className="h-full bg-gradient-to-r from-[--accent-color] to-purple-500 transition-all duration-500 ease-out"
                  style={{ width: `${(currentStep / 2) * 100}%` }}
                />
              </div>

              {/* Step Circles */}
              {Object.entries(STEPS).map(([key, value], index) => {
                const Icon = STEP_CONFIG[value as Step].icon;
                return (
                  <div key={key} className="relative z-10">
                    <div className="flex flex-col items-center">
                      <div 
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500",
                          currentStep >= value 
                            ? "bg-gradient-to-r from-[--accent-color] to-purple-500 shadow-lg shadow-[--accent-color]/20" 
                            : "bg-black-4 text-gray-400"
                        )}
                      >
                        <Icon className={cn(
                          "w-6 h-6 transition-all duration-500",
                          currentStep >= value ? "text-white-1" : "text-gray-400"
                        )} />
                      </div>
                      <div className="mt-3 text-center">
                        <p className={cn(
                          "font-semibold transition-all duration-500",
                          currentStep >= value ? "text-white-1" : "text-gray-400"
                        )}>
                          {STEP_CONFIG[value as Step].title}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="p-8">
                {/* Current Step Title */}
                <div className="mb-3">
                </div>

                {/* Step Content */}
                <div className="min-h-[400px]">
                  {currentStep === STEPS.DETAILS && (
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="podcastTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-16 font-bold text-white-1">Title</FormLabel>
                            <FormControl>
                              <Input
                                className="input-class bg-black-1/50 border-black-4 focus:border-[--accent-color] text-white-1 h-12 transition-all duration-300 hover:border-[--accent-color]/50"
                                placeholder="Enter your podcast title..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-2">
                        <FormLabel htmlFor="voice-select" className="text-16 font-bold text-white-1">
                          Select AI Voice
                        </FormLabel>
                        <Select onValueChange={setVoiceType} value={voiceType || undefined}>
                          <SelectTrigger
                            id="voice-select"
                            className="bg-black-1/50 border-black-4 text-white-1 h-12 transition-all duration-300 hover:border-[--accent-color]/50"
                          >
                            <SelectValue placeholder="Choose a voice for your podcast" />
                          </SelectTrigger>
                          <SelectContent className="bg-black-1 border-black-4">
                            {voiceCategories.map((voice) => (
                              <SelectItem
                                key={voice}
                                value={voice}
                                className="text-white-1 focus:bg-[--accent-color] focus:text-white-1 cursor-pointer"
                              >
                                {voice.charAt(0).toUpperCase() + voice.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <FormField
                        control={form.control}
                        name="podcastDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-16 font-bold text-white-1">Description</FormLabel>
                            <FormControl>
                              <Textarea
                                className="input-class bg-black-1/50 border-black-4 focus:border-[--accent-color] text-white-1 min-h-[120px] transition-all duration-300 hover:border-[--accent-color]/50"
                                placeholder="Write a compelling description for your podcast..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />

                      {showRequiredFields && !canProceedToScript && (
                        <RequiredFieldsAlert fields={STEP_CONFIG[STEPS.DETAILS].requiredFields.filter(field => {
                          if (field === "Title") return !title;
                          if (field === "Voice") return !voiceType;
                          if (field === "Description") return !description;
                          return false;
                        })} />
                      )}
                    </div>
                  )}

                  {currentStep === STEPS.SCRIPT && (
                    <div className="space-y-6">
                      <GeneratePodcast
                        setAudioStorageId={handleSetAudioStorageId}
                        setAudio={setAudioUrl}
                        voiceType={voiceType || ""}
                        audio={audioUrl}
                        voicePrompt={voicePrompt}
                        setVoicePrompt={setVoicePrompt}
                        setAudioDuration={setAudioDuration}
                        onGenerationStart={() => {
                          setGenerationStage("QUEUE");
                          setTimeout(() => setGenerationStage("CONNECTING"), 800);
                        }}
                        onGenerationComplete={() => {
                          setGenerationStage("UPLOADING");
                          setTimeout(() => setGenerationStage(null), 1000);
                        }}
                        showEditSection={!!audioUrl}
                      />
                      {generationStage && (
                        <GenerationProgress stage={generationStage} />
                      )}
                      {showRequiredFields && !audioUrl && (
                        <RequiredFieldsAlert fields={["Generate podcast audio"]} />
                      )}
                    </div>
                  )}

                  {currentStep === STEPS.THUMBNAIL && (
                    <div className="space-y-6">
                      <GenerateThumbnail
                        setImageStorageId={handleSetImageStorageId}
                        setImage={setImageUrl}
                        image={imageUrl}
                        imagePrompt={imagePrompt}
                        setImagePrompt={setImagePrompt}
                        onGenerationStart={() => {
                          setGenerationStage("QUEUE");
                          setTimeout(() => setGenerationStage("CONNECTING"), 800);
                        }}
                        onGenerationComplete={() => {
                          setGenerationStage("UPLOADING");
                          setTimeout(() => setGenerationStage(null), 1000);
                        }}
                      />
                      {generationStage && (
                        <GenerationProgress stage={generationStage} />
                      )}
                      {showRequiredFields && !imageUrl && (
                        <RequiredFieldsAlert fields={["Generate thumbnail image"]} />
                      )}
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t border-black-4/50">
                  {currentStep > STEPS.DETAILS ? (
                    <Button
                      type="button"
                      onClick={handleBack}
                      className="bg-black-4/50 hover:bg-black-3 text-white-1/80 hover:text-white-1 px-6 h-12 transition-all duration-300"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  ) : (
                    <div />
                  )}

                  {currentStep < STEPS.THUMBNAIL ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className={cn(
                        "bg-gradient-to-r from-[--accent-color] to-purple-500 text-white-1 px-6 h-12 transition-all duration-300",
                        (!canProceedToScript && currentStep === STEPS.DETAILS) || (!audioUrl && currentStep === STEPS.SCRIPT)
                          ? "opacity-40 cursor-not-allowed from-gray-500 to-gray-600 hover:opacity-40"
                          : "hover:opacity-90 shadow-lg shadow-[--accent-color]/20"
                      )}
                      disabled={(!canProceedToScript && currentStep === STEPS.DETAILS) || (!audioUrl && currentStep === STEPS.SCRIPT)}
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className={cn(
                        "bg-gradient-to-r text-white-1 px-6 h-12 transition-all duration-300",
                        (!canSubmit || isSubmitting)
                          ? "from-gray-500 to-gray-600 opacity-40 cursor-not-allowed hover:opacity-40"
                          : "from-[--accent-color] to-purple-500 hover:opacity-90 shadow-lg shadow-[--accent-color]/20"
                      )}
                      disabled={!canSubmit || isSubmitting}
                      onClick={(e) => {
                        if (!imageUrl || !audioUrl) {
                          e.preventDefault();
                          setShowRequiredFields(true);
                          toast.error("Please complete all required fields");
                          return;
                        }
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          Publishing
                          <Loader className="w-4 h-4 ml-2 animate-spin" />
                        </>
                      ) : (
                        <>
                          Publish Podcast
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
