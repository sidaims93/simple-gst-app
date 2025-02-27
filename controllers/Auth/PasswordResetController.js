export default function passwordReset(req, res) {
  console.log("=======req.body=======");
  console.log(req.body);

  return res.json({
    status: true,
    message: "In passwordReset controller function ",
  });
}
