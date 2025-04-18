"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateDID } from "@/components/create-did"
import { ViewDID } from "@/components/view-did"
import { VerifyCredential } from "@/components/verify-credential"
import { ConnectWallet } from "@/components/connect-wallet"
import { BesuProvider } from "@/context/besu-provider"
import { UpdateDID } from "@/components/update-did"
export function DIDDashboard() {
  const [isConnected, setIsConnected] = useState(false)

  return (
    <BesuProvider>
      <div className="container mx-auto py-10">
        <h1 className="text-4xl font-bold mb-8 text-center">Digital Identity Management</h1>

        {!isConnected ? (
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Connect to Hyperledger Besu</CardTitle>
                <CardDescription>Connect your wallet to manage digital identities on Hyperledger Besu</CardDescription>
              </CardHeader>
              <CardContent>
                <ConnectWallet onConnect={() => setIsConnected(true)} />
              </CardContent>
            </Card>
          </div>
        ) : (
          <Tabs defaultValue="create" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="create">Create DID</TabsTrigger>
              <TabsTrigger value="view">View DID</TabsTrigger>
              <TabsTrigger value="verify">Verify Credentials</TabsTrigger>
              <TabsTrigger value="update">Update DID</TabsTrigger>
            </TabsList> 
            <TabsContent value="create">
              <CreateDID />
            </TabsContent>
            <TabsContent value="view">
              <ViewDID />
            </TabsContent>
            <TabsContent value="verify">
              <VerifyCredential />
            </TabsContent>
            <TabsContent value="update">
              <UpdateDID />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </BesuProvider>
  )
}

