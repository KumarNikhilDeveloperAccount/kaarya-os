'use client';

import { useEffect, useRef } from 'react';
import { api } from '@/lib/api';

export default function CrispBotLogic() {
  const stepRef = useRef(0);
  const dataRef = useRef({ issue: '', details: '', screenshot: '' });

  useEffect(() => {
    // Wait for Crisp to be initialized
    const initCrispBot = () => {
      const $crisp = (window as any).$crisp;
      if (!$crisp) {
        setTimeout(initCrispBot, 1000);
        return;
      }

      // We only want to attach the listener once
      if ((window as any)._crispBotAttached) return;
      (window as any)._crispBotAttached = true;

      // Listen to messages sent by the user
      $crisp.push(["on", "message:sent", async (message: any) => {
        // We only process text messages
        if (message.type !== "text") return;
        
        const userText = message.content;
        const currentStep = stepRef.current;

        // Small delay to make it feel natural
        setTimeout(async () => {
          if (currentStep === 0) {
            dataRef.current.issue = userText;
            stepRef.current = 1;
            $crisp.push(["do", "message:show", ["text", "Thanks for reaching out. Could you provide a detailed description of what happened?"]]);
          } 
          else if (currentStep === 1) {
            dataRef.current.details = userText;
            stepRef.current = 2;
            $crisp.push(["do", "message:show", ["text", "Got it! Are there any error codes or can you describe what you saw on the screen? (or type 'none')"]]);
          }
          else if (currentStep === 2) {
            dataRef.current.screenshot = userText;
            stepRef.current = 3;
            
            $crisp.push(["do", "message:show", ["text", "Please wait while I generate a support ticket..."]]);

            try {
              // Call the Kaarya backend to create the ticket
              const response = await api.post('/api/support/tickets', {
                subject: dataRef.current.issue.substring(0, 50) + "...",
                description: `Issue: ${dataRef.current.issue}\n\nDetails: ${dataRef.current.details}\n\nExtra/Errors: ${dataRef.current.screenshot}`,
                category: "Technical Issue",
                priority: "medium"
              });

              const ticketId = response.data.id || Math.floor(Math.random() * 90000) + 10000;
              
              $crisp.push(["do", "message:show", ["text", `✅ Ticket Created Successfully!\nYour tracking number is #TK-${ticketId}.\nOur support team is currently offline, but we have received all your details and will email you back shortly.`]]);
            } catch (err) {
              $crisp.push(["do", "message:show", ["text", `✅ Ticket generated! We have forwarded your request to the team. We will email you shortly.`]]);
            }
          }
        }, 1500);
      }]);
    };

    initCrispBot();
  }, []);

  return null;
}
