
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Clock, DollarSign, FileText, Crown, Copy, ThumbsUp } from "lucide-react";

interface PromptResult {
  id: string;
  variant: string;
  prompt: string;
  output: string;
  metrics: {
    qualityScore: number;
    relevanceScore: number;
    hallucinationScore: number;
    responseTime: number;
    tokenCount: number;
    cost: number;
    wordCount: number;
  };
  isWinner?: boolean;
}

const PromptComparison = () => {
  const [selectedView, setSelectedView] = useState("side-by-side");

  // Mock data for demonstration
  const results: PromptResult[] = [
    {
      id: "1",
      variant: "Variant A",
      prompt: "Write a professional refund email for a customer who received a damaged product.",
      output: "Dear Valued Customer,\n\nI sincerely apologize for the damaged product you received. We take quality seriously and want to make this right immediately.\n\nI've processed a full refund of $89.99 to your original payment method, which should appear within 3-5 business days. Additionally, I'd like to offer you a 20% discount on your next order as an apology for this inconvenience.\n\nPlease keep the damaged item - no need to return it. If you need any assistance with your next order, please don't hesitate to reach out.\n\nBest regards,\nCustomer Service Team",
      metrics: {
        qualityScore: 9.2,
        relevanceScore: 9.5,
        hallucinationScore: 1.2,
        responseTime: 1240,
        tokenCount: 156,
        cost: 0.0042,
        wordCount: 89
      },
      isWinner: true
    },
    {
      id: "2",
      variant: "Variant B",
      prompt: "As a customer service representative, create a refund email response for damaged goods.",
      output: "Hi there,\n\nSorry about the damaged product! We'll send you a refund right away.\n\nYour refund is being processed and you should see it in a few days. Thanks for letting us know about this issue.\n\nLet us know if you need anything else!\n\nThanks,\nSupport Team",
      metrics: {
        qualityScore: 6.8,
        relevanceScore: 7.2,
        hallucinationScore: 0.8,
        responseTime: 890,
        tokenCount: 98,
        cost: 0.0026,
        wordCount: 52
      }
    },
    {
      id: "3",
      variant: "Variant C",
      prompt: "Generate a detailed, empathetic refund email for a customer complaint about product damage.",
      output: "Dear [Customer Name],\n\nThank you for reaching out to us regarding the damaged product in your recent order. I want to personally apologize for this experience, as it falls short of the quality standards we strive to maintain.\n\nAfter reviewing your case, I have immediately initiated a full refund of $89.99. The refund will be credited to your original payment method within 2-3 business days. You will receive a confirmation email once the transaction is complete.\n\nTo express our commitment to your satisfaction, I'm also providing you with a complimentary expedited shipping voucher for your next order. Our quality assurance team has been notified of this issue to prevent similar occurrences.\n\nWe truly value your business and hope to have the opportunity to serve you better in the future.\n\nWarmest regards,\n[Your Name]\nCustomer Experience Specialist",
      metrics: {
        qualityScore: 8.9,
        relevanceScore: 9.1,
        hallucinationScore: 1.5,
        responseTime: 1680,
        tokenCount: 203,
        cost: 0.0055,
        wordCount: 142
      }
    }
  ];

  const MetricCard = ({ icon: Icon, label, value, unit = "", comparison }: any) => (
    <div className="bg-white/50 p-3 rounded-lg border">
      <div className="flex items-center space-x-2 mb-1">
        <Icon className="w-4 h-4 text-gray-600" />
        <span className="text-xs text-gray-600">{label}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold">{value}{unit}</span>
        {comparison && (
          <Badge variant={comparison > 0 ? "default" : "secondary"} className="text-xs">
            {comparison > 0 ? "+" : ""}{comparison}%
          </Badge>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Prompt Comparison</h2>
          <p className="text-gray-600">Email Refund Prompts Experiment</p>
        </div>
        <Tabs value={selectedView} onValueChange={setSelectedView}>
          <TabsList>
            <TabsTrigger value="side-by-side">Side by Side</TabsTrigger>
            <TabsTrigger value="detailed">Detailed View</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {selectedView === "side-by-side" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {results.map((result) => (
            <Card key={result.id} className={`relative ${result.isWinner ? 'ring-2 ring-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100' : 'bg-white/70'} backdrop-blur-sm border-0 shadow-lg`}>
              {result.isWinner && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 p-2 rounded-full">
                  <Crown className="w-4 h-4" />
                </div>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{result.variant}</CardTitle>
                  {result.isWinner && (
                    <Badge className="bg-yellow-400 text-yellow-900">Winner</Badge>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-bold text-lg">{result.metrics.qualityScore}</span>
                    <span className="text-sm text-gray-500">/10</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Prompt */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Prompt</h4>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    {result.prompt}
                  </div>
                </div>

                {/* Output Preview */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Output (Preview)</h4>
                  <div className="bg-white p-3 rounded-lg text-sm border max-h-32 overflow-y-auto">
                    {result.output.substring(0, 150)}...
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <MetricCard
                    icon={Clock}
                    label="Response Time"
                    value={result.metrics.responseTime}
                    unit="ms"
                  />
                  <MetricCard
                    icon={DollarSign}
                    label="Cost"
                    value={result.metrics.cost.toFixed(4)}
                    unit="$"
                  />
                  <MetricCard
                    icon={FileText}
                    label="Tokens"
                    value={result.metrics.tokenCount}
                  />
                  <MetricCard
                    icon={FileText}
                    label="Words"
                    value={result.metrics.wordCount}
                  />
                </div>

                {/* Quality Scores */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Quality Metrics</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Relevance</span>
                      <span className="font-medium">{result.metrics.relevanceScore}/10</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Hallucination</span>
                      <span className="font-medium text-green-600">{result.metrics.hallucinationScore}/10</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                  {result.isWinner && (
                    <Button size="sm" className="flex-1 bg-yellow-500 hover:bg-yellow-600">
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      Promote
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedView === "detailed" && (
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Detailed Comparison</CardTitle>
            <CardDescription>Full outputs and comprehensive metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Detailed View</h3>
              <p className="text-gray-500">Full comparison table with complete outputs will be displayed here</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PromptComparison;
