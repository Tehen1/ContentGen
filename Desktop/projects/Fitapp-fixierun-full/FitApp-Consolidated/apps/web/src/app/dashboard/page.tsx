import React from "react";
    import { 
      Card, 
      CardContent, 
      CardHeader, 
      CardTitle, 
      CardDescription 
    } from "../../components/ui/card";
    import { TokenBalance } from "../../components/blockchain/token-balance";
    import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Cell, PieChart, Pie, ResponsiveContainer } from 'recharts';

<CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pastWeekData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                        <Tooltip />
                        <Bar yAxisId="left" dataKey="distance" fill="#8884d8" name="Distance (km)" />
                        <Bar yAxisId="right" dataKey="count" fill="#82ca9d" name="Activities" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Activity Types Pie Chart */}
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle>Activity Types</CardTitle>
                    <CardDescription>Breakdown of your activities</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    {activityTypeData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={activityTypeData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {activityTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No activity data yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activities and Rewards */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activities</CardTitle>
                    <CardDescription>Your latest recorded activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {activities && activities.length > 0 ? (
                      <div className="space-y-4">
                        {activities.slice(0, 3).map((activity) => (
                          <div key={activity.id} className="flex items-center">
                            <div className="mr-4">
                              {activity.activity_type === "run" && (
                                <span className="p-2 bg-blue-100 text-blue-700 rounded-full">🏃</span>
                              )}
                              {activity.activity_type === "cycle" && (
                                <span className="p-2 bg-green-100 text-green-700 rounded-full">🚴</span>
                              )}
                              {activity.activity_type === "walk" && (
                                <span className="p-2 bg-yellow-100 text-yellow-700 rounded-full">🚶</span>
                              )}
                              {activity.activity_type === "swim" && (
                                <span className="p-2 bg-cyan-100 text-cyan-700 rounded-full">🏊</span>
                              )}
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium leading-none">
                                {activity.activity_type.charAt(0).toUpperCase() + activity.activity_type.slice(1)} -{" "}
                                {(activity.distance / 1000).toFixed(1)} km
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(activity.start_time).toLocaleDateString()} ({formatDuration({
                                  minutes: Math.floor(activity.duration / 60)
                                })}
                                )
                              </p>
                            </div>
                            <div className="ml-auto text-xs">
                              {activity.verified ? (
                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-100 text-green-800">
                                  Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-gray-800 bg-gray-100">
                                  Pending
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full" href="/activities">
                          View All Activities
                        </Button>
                      </div>
                    ) : (
                      <Alert>
                        <AlertTitle>No activities recorded yet</AlertTitle>
                        <AlertDescription>
                          Start recording your physical activities to earn rewards!
                          <div className="mt-4">
                            <Button href="/activities/record">Record Activity</Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Rewards</CardTitle>
                    <CardDescription>Your latest earned tokens</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {rewards && rewards.length > 0 ? (
                      <div className="space-y-4">
                        {rewards.slice(0, 3).map((reward) => (
                          <div key={reward.id} className="flex items-center">
                            <div className="mr-4">
                              <span className="p-2 bg-amber-100 text-amber-700 rounded-full">🏆</span>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium leading-none">
                                {(reward.amount / 10**18).toFixed(2)} FIT
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {reward.activityType} - {formatDistance(new Date(reward.timestamp * 1000), new Date(), {
                                  addSuffix: true
                                })}
                              </p>
                            </div>
                            <div className="ml-auto">
                              <a
                                href={`https://explorer.polygon.technology/tx/${reward.transactionHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                              >
                                View
                              </a>
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full" href="/rewards">
                          View All Rewards
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground mb-4">Complete activities to earn FIT tokens!</p>
                        <TokenBalance address={address as string} showFullDetails />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            {/* Activities Tab */}
            <TabsContent value="activities">
              <div className="grid gap-4 grid-cols-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Activity History</CardTitle>
                    <CardDescription>All your recorded activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {activities && activities.length > 0 ? (
                      <ActivityList activities={activities} />
                    ) : (
                      <Alert>
                        <AlertTitle>No activities recorded yet</AlertTitle>
                        <AlertDescription>
                          Start recording your physical activities to earn rewards!
                          <div className="mt-4">
                            <Button href="/activities/record">Record Activity</Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements">
              <div className="grid gap-4 grid-cols-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Achievements</CardTitle>
                    <CardDescription>NFTs earned through fitness activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {achievements && achievements.length > 0 ? (
                      <AchievementGallery achievements={achievements} />
                    ) : (
                      <Alert>
                        <AlertTitle>No achievements yet</AlertTitle>
                        <AlertDescription>
                          Complete activities to earn achievement NFTs! Achievements are unlocked based on your
                          performance and consistency.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
